import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';
import Appliance from '../models/Appliance.js';
import { sendEmail, sendPushNotification, sendTemplatedEmail } from '../middleware/notification.js';
import { paginate, createPaginationResponse } from '../utils/helpers.js';
import TechnicianNotificationService from '../services/technicianNotificationService.js';

// ─────────────────────────────────────────────
// CREATE BOOKING
// Flow: user selects appliance → optional issue → address → hits "Book Technician"
// No technician is selected by user. All appliance details are auto-fetched.
// ─────────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { user } = req;
    const {
      applianceId,
      serviceType = 'regular',
      selectedIssue,
      issueDescription,
      serviceAddress, // Should include { street, city, state, pincode, coordinates: { coordinates: [lng, lat] } }
      preferredDate,
      preferredTime,
      priority = 'medium' // Added: Model has priority field
    } = req.body;

    const appliance = await Appliance.findById(applianceId);
    if (!appliance || !appliance.isActive) {
      return res.status(404).json({ success: false, message: 'Appliance not found' });
    }

    // Pricing Calculation
    let basePrice = appliance.basePrice;
    let serviceCharge = appliance.serviceCharge;
    let emergencyCharge = serviceType === 'emergency' ? (appliance.emergencyCharge || 0) : 0;
    let sparePartsCost = 0;

    if (selectedIssue) {
      const matched = appliance.commonIssues.find(ci => ci.issue === selectedIssue);
      if (matched) basePrice = matched.estimatedCost;
    }

    const total = basePrice + serviceCharge + emergencyCharge + sparePartsCost;
    const finalDescription = [selectedIssue, issueDescription].filter(Boolean).join(' — ') || 'General service';

    const newBooking = new Booking({
      user: user._id,
      appliance: applianceId,
      serviceType,
      priority, // Added
      issueDescription: finalDescription,
      serviceAddress, 
      preferredDate: new Date(preferredDate),
      preferredTime,
      estimatedCost: { basePrice, serviceCharge, emergencyCharge, sparePartsCost, total },
      // Initializing payment state as per model
      payment: {
        status: 'pending',
        amount: total
      },
      status: 'pending',
      // Timeline updated via pre-save middleware, but we can set updatedBy here
      timeline: [{
        status: 'pending',
        note: 'Booking initialized by user',
        updatedBy: user._id,
        timelineModel: 'User'
      }]
    });

    await newBooking.save();

    // Notify logic (Fire and forget)
    // notifyNearbyTechnicians(newBooking, appliance);
    TechnicianNotificationService.notifyNewBookingRequest(newBooking).catch(err => console.error(err));

    return res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// NOTIFY NEARBY TECHNICIANS
// Called after booking is saved. Finds all active, verified technicians
// in the same service area and sends push + email to each.
// ─────────────────────────────────────────────
const notifyNearbyTechnicians = async (booking, appliance) => {
  try {
    const { serviceAddress } = booking;

    // Find technicians whose service area covers the booking's city/state/pincode
    const nearbyTechnicians = await Technician.find({
      isActive: true,
      isOnline: true,
      verificationStatus: 'verified',
      serviceAreas: {
        $elemMatch: {
          $or: [
            { pincode: serviceAddress.pincode },
            { city: serviceAddress.city }
          ]
        }
      }
    });

    //     const nearbyTechnicians = await Technician.find({
    //   isActive: true,
    //   verificationStatus: 'verified',
    //   'serviceAreas.coordinates': {
    //     $near: {
    //       $geometry: {
    //         type: "Point",
    //         coordinates: serviceAddress.coordinates.coordinates // [lng, lat]
    //       },
    //       $maxDistance: 15000 // 15 kilometers in meters 
    //     }
    //   }
    // });

    console.log(
      `[Booking ${booking.bookingId}] Found ${nearbyTechnicians.length} nearby technicians`
    );

    if (nearbyTechnicians.length === 0) {
      // Notify admin that no technicians are available
      const Admin = await import('../models/Admin.js').then((m) => m.default);
      const admins = await Admin.find({ isActive: true });

      await Promise.all(
        admins.map((admin) =>
          sendEmail(
            admin.email,
            'No Technicians Available',
            `No technicians available for booking ${booking.bookingId} in ${serviceAddress.city}, ${serviceAddress.state}.\n\n` +
            `Appliance: ${appliance.brand} ${appliance.model}\n` +
            `Service type: ${booking.serviceType}\n` +
            `Address: ${serviceAddress.street}, ${serviceAddress.city}, ${serviceAddress.state} ${serviceAddress.pincode}`
          )
        )
      );
      return;
    }

    // Notify all nearby technicians simultaneously
    const notificationPromises = nearbyTechnicians.map(async (technician) => {
      try {
        await sendPushNotification(
          technician._id,
          'New Service Request',
          `New ${appliance.category} repair in ${serviceAddress.city} — accept now`
        );

        await sendTemplatedEmail(technician.email, 'newServiceRequest', {
          firstName: technician.firstName,
          bookingId: booking.bookingId,
          applianceName: `${appliance.brand} ${appliance.model}`,
          serviceType: booking.serviceType,
          address: `${serviceAddress.street}, ${serviceAddress.city}, ${serviceAddress.state}`,
          issueDescription: booking.issueDescription,
          finalAmount: booking.estimatedCost.total,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
        });

        // Record notification in technician's notifications array
        await Technician.findByIdAndUpdate(technician._id, {
          $push: {
            notifications: {
              type: 'service_request',
              message: `New booking ${booking.bookingId} available in your area`,
              booking: booking._id,
              createdAt: new Date(),
            },
          },
        });
      } catch (err) {
        console.error(`Failed to notify technician ${technician._id}:`, err);
      }
    });

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error('Error notifying nearby technicians:', error);
  }
};

// ─────────────────────────────────────────────
// ACCEPT BOOKING
// The first technician to hit this endpoint gets the booking.
// Atomic findOneAndUpdate prevents double-acceptance (race condition safe).
// ─────────────────────────────────────────────
export const acceptBooking = async (req, res) => {
  try {
    const technician = req.user; // Fixed: use req.user instead of req.technician
    const { bookingId } = req.params;

    // Atomic update: only succeeds if booking is still pending AND has no technician yet
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: 'pending',
        technician: { $exists: false }, 
      },
      {
        $set: {
          status: 'confirmed',
          technician: technician._id,
          assignedAt: new Date(),
        },
        $push: {
          timeline: {
            status: 'confirmed',
            note: 'Booking accepted by technician',
            updatedBy: technician._id,
            timelineModel: 'Technician'
          }
        }
      },
      { new: true }
    );

    if (!updatedBooking) {
      // Either booking doesn't exist, or another technician already accepted it
      const existing = await Booking.findById(bookingId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      return res.status(409).json({
        success: false,
        message: 'This booking has already been accepted by another technician',
      });
    }

    // Increment the totalBookings count for the successful technician
    await Technician.findByIdAndUpdate(technician._id, {
      $inc: { totalBookings: 1 }
    });

    // Notify technician about booking assignment using the new service
    TechnicianNotificationService.notifyBookingAssigned(updatedBooking, technician._id).catch((err) =>
      console.error('TechnicianNotificationService notifyBookingAssigned error:', err)
    );

    // Notify the user immediately with technician details
    const user = await User.findById(updatedBooking.user);
    if (user) {
      await sendPushNotification(
        user._id,
        'Technician Found!',
        `${technician.firstName} ${technician.lastName} is on the way to fix your appliance`
      );

      await sendTemplatedEmail(user.email, 'technicianAssigned', {
        firstName: user.firstName,
        bookingId: updatedBooking.bookingId,
        technicianName: `${technician.firstName} ${technician.lastName}`,
        technicianEmail: technician.email,
        technicianPhone: technician.phone,
        preferredDate: updatedBooking.preferredDate,
        preferredTime: updatedBooking.preferredTime,
      });
    }

    // Notify all other technicians in the area that this booking is gone
    notifyOtherTechniciansBookingTaken(updatedBooking, technician._id).catch((err) =>
      console.error('notifyOtherTechniciansBookingTaken error:', err)
    );

    return res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      data: {
        booking: updatedBooking,
      },
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept booking',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// NOTIFY OTHER TECHNICIANS: BOOKING TAKEN
// Push notification to all other nearby technicians so they stop seeing it.
// ─────────────────────────────────────────────
const notifyOtherTechniciansBookingTaken = async (booking, acceptedTechnicianId) => {
  try {
    const nearbyTechnicians = await Technician.find({
      _id: { $ne: acceptedTechnicianId },
      isActive: true,
      verificationStatus: 'verified',
      'serviceAreas.city': booking.serviceAddress.city,
      'serviceAreas.state': booking.serviceAddress.state,
    });

    await Promise.allSettled(
      nearbyTechnicians.map(async (technician) => {
        try {
          await sendPushNotification(
            technician._id,
            'Booking Taken',
            `Booking ${booking.bookingId} has been accepted by another technician`
          );

          await Technician.findByIdAndUpdate(technician._id, {
            $push: {
              notifications: {
                type: 'booking_taken',
                message: `Booking ${booking.bookingId} is no longer available`,
                booking: booking._id,
                createdAt: new Date(),
              },
            },
          });
        } catch (err) {
          console.error(`Failed to notify technician ${technician._id}:`, err);
        }
      })
    );
  } catch (error) {
    console.error('Error notifying other technicians:', error);
  }
};

// ─────────────────────────────────────────────
// GET BOOKING DETAILS
// ─────────────────────────────────────────────
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { user } = req;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email phone')
      .populate('technician', 'firstName lastName email phone')
      .populate('appliance', 'name brand model category subCategory');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      booking.user._id.toString() !== user._id.toString() &&
      req.userRole !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// CANCEL BOOKING
// ─────────────────────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const { user, admin } = req;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!admin && booking.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel in current state.',
      });
    }

    const actorId = admin ? admin._id : user._id;
    const actorModel = admin ? 'Admin' : 'User';

    booking.status = 'cancelled';
    booking.cancelledBy = actorId;
    booking.cancelledAt = new Date();
    booking.cancellationModel = actorModel;
    booking.cancellationReason = reason;
    booking.timeline.push({
      status: 'cancelled',
      note: reason || 'Cancelled by ' + actorModel,
      updatedBy: actorId,
      timelineModel: actorModel
    });
    await booking.save();

    // Notify assigned technician if there is one
    if (booking.technician) {
      const technician = await Technician.findById(booking.technician);
      if (technician) {
        await sendPushNotification(
          technician._id,
          'Booking Cancelled',
          `Booking ${booking.bookingId} has been cancelled`
        );
        await sendTemplatedEmail(technician.email, 'bookingCancelled', {
          firstName: technician.firstName,
          bookingId: booking.bookingId,
          reason: reason || 'No reason provided',
          cancelledBy: booking.cancelledBy,
        });
      }
    }

    if (!admin) {
      await sendPushNotification(
        user._id,
        'Booking Cancelled',
        `Your booking ${booking.bookingId} has been cancelled`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET AVAILABLE BOOKINGS (for technician dashboard)
// ─────────────────────────────────────────────
// export const getAvailableBookings = async (req, res) => {
//   try {
//     // 1. Get the technician from req.user (populated by your auth middleware)
//     const technician = req.user; 
//     const { page = 1, limit = 10 } = req.query;

//     const technicianDoc = await Technician.findById(technician._id);
    
//     // 2. Destructure the array correctly
//     const { serviceAreas } = technicianDoc;

//     // 3. Check if technician actually has service areas defined
//     if (!serviceAreas || serviceAreas.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: 'No service areas defined for this technician',
//         data: { data: [], pagination: { total: 0 } }
//       });
//     }

//     // 4. Build query using the first service area's data
//     // Or use $in if you want to check ALL service areas the tech covers
//     const query = {
//       status: 'pending',
//       technician: { $exists: false },
//       'serviceAddress.city': serviceAreas[0].city,   // FIXED: Accessing index 0
//       'serviceAddress.state': serviceAreas[0].state, // FIXED: Accessing index 0
//     };

//     const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

//     const bookings = await Booking.find(query)
//       .populate('user', 'firstName lastName phone')
//       .populate('appliance', 'name brand model category subCategory')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limitNum);

//     const total = await Booking.countDocuments(query);

//     return res.status(200).json({
//       success: true,
//       message: 'Available bookings retrieved successfully',
//       data: createPaginationResponse(bookings, parseInt(page), limitNum, total),
//     });
//   } catch (error) {
//     console.error('Get available bookings error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve available bookings',
//       error: error.message,
//     });
//   }
// };

export const getAvailableBookings = async (req, res) => {
  try {
    const technician = req.user; 
    const { page = 1, limit = 10, useGeo = 'false' } = req.query;

    // 1. Fetch the full technician profile to get their coverage zones
    const technicianDoc = await Technician.findById(technician._id);
    
    if (!technicianDoc || !technicianDoc.serviceAreas || technicianDoc.serviceAreas.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No service areas defined. Update profile to see bookings.',
        data: { bookings: [], pagination: { total: 0, pages: 0, current: page } }
      });
    }

    // 2. Build the Logic Query
    let query = {
      status: 'pending',
      technician: { $exists: false }, // Only unassigned jobs
    };

    // 3. Multizone Matching Logic
    if (useGeo === 'true' && technicianDoc.currentLocation) {
      // GEOSPATIAL SEARCH: Uses the 2dsphere index in your Booking model
      query['serviceAddress.coordinates'] = {
        $near: {
          $geometry: technicianDoc.currentLocation,
          $maxDistance: 20000 // 20km radius
        }
      };
    } else {
      // STRING MATCHING: Scan all cities/pincodes the tech covers
      const cities = technicianDoc.serviceAreas.map(area => area.city);
      const pincodes = technicianDoc.serviceAreas.map(area => area.pincode);

      query['$or'] = [
        { 'serviceAddress.city': { $in: cities } },
        { 'serviceAddress.pincode': { $in: pincodes } }
      ];
    }

    // 4. Execution & Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName phone')
      .populate('appliance', 'name brand model category subCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          current: parseInt(page),
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Spatial Engine Retrieval Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize available bookings',
      error: error.message,
    });
  }
};

export default {
  createBooking,
  acceptBooking,
  cancelBooking,
  getAvailableBookings,
  getBookingDetails,
};