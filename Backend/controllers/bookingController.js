import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';
import Appliance from '../models/Appliance.js';
import { sendEmail, sendPushNotification, sendTemplatedEmail } from '../middleware/notification.js';
import { paginate, createPaginationResponse } from '../utils/helpers.js';

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
      selectedIssue,     // optional: one of appliance.commonIssues
      issueDescription,  // optional: free-text from user
      serviceAddress,    // { street, city, state, pincode, coordinates }
      preferredDate,
      preferredTime,
    } = req.body;

    // 1. Validate appliance exists and is active
    const appliance = await Appliance.findById(applianceId);
    if (!appliance || !appliance.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found or not available',
      });
    }

    // 2. Auto-fetch pricing from appliance
    let basePrice = appliance.basePrice;
    let serviceCharge = appliance.serviceCharge;
    let emergencyCharge = serviceType === 'emergency' ? (appliance.emergencyCharge || 0) : 0;

    // If a known issue was selected, adjust estimated cost
    let sparePartsCost = 0;
    if (selectedIssue) {
      const matched = appliance.commonIssues.find(
        (ci) => ci.issue === selectedIssue
      );
      if (matched) {
        basePrice = matched.estimatedCost; // override base with issue-specific cost
      }
    }

    const total = basePrice + serviceCharge + emergencyCharge + sparePartsCost;

    // 3. Build issue description (combine selected issue + free text)
    const finalDescription =
      [selectedIssue, issueDescription].filter(Boolean).join(' — ') || 'General service required';

    // 4. Create booking WITHOUT a technician (status: pending)
    const newBooking = new Booking({
      user: user._id,
      appliance: applianceId,
      // technician is intentionally omitted — set when a technician accepts
      serviceType,
      issueDescription: finalDescription,
      serviceAddress,
      preferredDate: new Date(preferredDate),
      preferredTime,
      estimatedCost: {
        basePrice,
        serviceCharge,
        emergencyCharge,
        sparePartsCost,
        total,
      },
      status: 'pending',
    });

    await newBooking.save();

    // 5. Notify all nearby technicians (fire-and-forget; don't block response)
    notifyNearbyTechnicians(newBooking, appliance).catch((err) =>
      console.error('notifyNearbyTechnicians error:', err)
    );

    return res.status(201).json({
      success: true,
      message: 'Booking created. Finding a technician near you…',
      data: {
        booking: {
          _id: newBooking._id,
          bookingId: newBooking.bookingId,
          status: newBooking.status,
          serviceType: newBooking.serviceType,
          issueDescription: newBooking.issueDescription,
          serviceAddress: newBooking.serviceAddress,
          preferredDate: newBooking.preferredDate,
          preferredTime: newBooking.preferredTime,
        },
        appliance: {
          name: appliance.name,
          brand: appliance.brand,
          model: appliance.model,
          category: appliance.category,
          subCategory: appliance.subCategory,
          commonIssues: appliance.commonIssues, // returned so frontend can show them
        },
        estimatedCost: {
          basePrice,
          serviceCharge,
          emergencyCharge,
          sparePartsCost,
          total,
        },
      },
    });
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
        technician: { $exists: false }, // guard against race conditions
      },
      {
        status: 'confirmed',
        technician: technician._id,
        assignedAt: new Date(),
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

    // Record acceptance in technician's notifications
    await Technician.findByIdAndUpdate(technician._id, {
      $push: {
        notifications: {
          type: 'booking_accepted',
          message: `You accepted booking ${updatedBooking.bookingId}`,
          booking: bookingId,
          createdAt: new Date(),
        },
      },
    });

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

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = admin ? 'admin' : 'user';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
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
export const getAvailableBookings = async (req, res) => {
  try {
    // 1. Get the technician from req.user (populated by your auth middleware)
    const technician = req.user; 
    const { page = 1, limit = 10 } = req.query;

    const technicianDoc = await Technician.findById(technician._id);
    
    // 2. Destructure the array correctly
    const { serviceAreas } = technicianDoc;

    // 3. Check if technician actually has service areas defined
    if (!serviceAreas || serviceAreas.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No service areas defined for this technician',
        data: { data: [], pagination: { total: 0 } }
      });
    }

    // 4. Build query using the first service area's data
    // Or use $in if you want to check ALL service areas the tech covers
    const query = {
      status: 'pending',
      technician: { $exists: false },
      'serviceAddress.city': serviceAreas[0].city,   // FIXED: Accessing index 0
      'serviceAddress.state': serviceAreas[0].state, // FIXED: Accessing index 0
    };

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName phone')
      .populate('appliance', 'name brand model category subCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Available bookings retrieved successfully',
      data: createPaginationResponse(bookings, parseInt(page), limitNum, total),
    });
  } catch (error) {
    console.error('Get available bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available bookings',
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