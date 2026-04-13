import Technician from '../models/Technician.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendEmail, sendPushNotification, sendTemplatedEmail } from '../middleware/notification.js';
import { uploadToCloudinary } from '../utils/helpers.js';
import { paginate, createPaginationResponse } from '../utils/helpers.js';

// Get Technician Profile
export const getTechnicianProfile = async (req, res) => {
  try {
    const technician = req.user;

    res.status(200).json({
      success: true,
      message: 'Technician profile retrieved successfully',
      data: {
        technician
      }
    });
  } catch (error) {
    console.error('Get technician profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician profile',
      error: error.message
    });
  }
};

// Update Technician Profile
export const updateTechnicianProfile = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const updates = req.body;

    // 1. CRITICAL: Protected Fields (Security)
    // We prevent the user from updating these via this route
    const protectedFields = [
      'password', 'role', 'isVerified', 'verificationStatus', 
      'email', 'earnings', 'rating', 'totalBookings', '_id'
    ];

    protectedFields.forEach(field => delete updates[field]);

    // 2. Logic for Skills (If string is sent, convert to array)
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map(s => s.trim());
    }

    // 3. Perform the update
    const updatedTechnician = await Technician.findByIdAndUpdate(
      technicianId,
      { $set: updates }, // $set allows updating only the provided fields
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { technician: updatedTechnician }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// Update Technician Avatar

export const updateAvatar = async (req, res) => {
  try {
    const technician = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
      

    // 1. Upload to Cloudinary (using your existing utility)
    const cloudinaryResponse = await uploadToCloudinary(req.file.path, 'technician_avatars');
    const avatarUrl = cloudinaryResponse.secure_url;

    // 2. Update the technician record
    const updatedTechnician = await Technician.findByIdAndUpdate(
      technician._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        avatar: avatarUrl,
        technician: updatedTechnician
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile picture',
      error: error.message
    });
  }
};

// Get Technician Bookings
export const getTechnicianBookings = async (req, res) => {
  try {
    const technician = req.user;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Build query
    const query = { technician: technician._id };
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('appliance', 'name brand model category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Technician bookings retrieved successfully',
      data: createPaginationResponse(bookings, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get technician bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician bookings',
      error: error.message
    });
  }
};

// Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const technician = req.user;
    const { bookingId, status, notes } = req.body;

    // Check if booking belongs to technician
    const booking = await Booking.findOne({
      _id: bookingId,
      technician: technician._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to you'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in_progress'],
      'in_progress': ['completed'],
      'completed': [], // Final status
      'cancelled': [] // Final status
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    // Update booking
    booking.status = status;
    if (notes) {
      booking.notes = booking.notes || [];
      booking.notes.push({
        technician: technician._id,
        text: notes,
        createdAt: new Date()
      });
    }

    if (status === 'in_progress') {
      booking.startTime = new Date();
    } else if (status === 'completed') {
      booking.endTime = new Date();
      booking.completedAt = new Date();

      // UPDATE TECHNICIAN STATS
      const Technician = await import('../models/Technician.js').then(m => m.default);
      await Technician.findByIdAndUpdate(technician._id, {
        $inc: { completedBookings: 1 }
        // Note: totalBookings should have been incremented when the booking was first created
      });
    }

    await booking.save();

    // Send notification to user
    await sendPushNotification(
      booking.user,
      'Booking Status Updated',
      `Your booking ${booking.bookingId} is now ${status}`
    );

    // Send email notification
    const User = await import('../models/User.js').then(m => m.default);
    const user = await User.findById(booking.user);
    if (user) {
      await sendTemplatedEmail(user.email, 'bookingStatusUpdate', {
        firstName: user.firstName,
        bookingId: booking.bookingId,
        status,
        technicianName: `${technician.firstName} ${technician.lastName}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get Technician Reviews
export const getTechnicianReviews = async (req, res) => {
  try {
    const technician = req.user;
    const { page = 1, limit = 10 } = req.query;

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const reviews = await Review.find({ technician: technician._id })
      .populate('user', 'firstName lastName avatar')
      .populate('booking', 'bookingId createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ technician: technician._id });

    res.status(200).json({
      success: true,
      message: 'Technician reviews retrieved successfully',
      data: createPaginationResponse(reviews, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get technician reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician reviews',
      error: error.message
    });
  }
};

// Update Technician Availability
export const updateTechnicianAvailability = async (req, res) => {
  try {
    // 1. Get ID from the authenticated user object
    const technicianId = req.user._id; 
    
    // 2. Expect 'isOnline' from the body instead of 'availability'
    const { isOnline } = req.body;

    // 3. Update isOnline AND refresh lastActive timestamp
    const updatedTechnician = await Technician.findByIdAndUpdate(
      technicianId,
      { 
        isOnline,
        lastActive: Date.now() // Track when they last toggled status
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `You are now ${isOnline ? 'Online' : 'Offline'}`,
      data: {
        isOnline: updatedTechnician.isOnline,
        lastActive: updatedTechnician.lastActive
      }
    });
  } catch (error) {
    console.error('Update technician availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
};

// Update Technician Location
export const updateTechnicianLocation = async (req, res) => {
  try {
    const technician = req.user;
    const { coordinates, address } = req.body;

    // Validate coordinates
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates (lat, lng) are required'
      });
    }

    // Prepare the service area object based on your Schema
    const newServiceArea = {
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      serviceRadius: address.serviceRadius || 10,
      coordinates: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat] // GeoJSON: [lng, lat]
      }
    };

    const updatedTechnician = await Technician.findByIdAndUpdate(
      technician._id,
      {
        // 1. Update the live GPS point
        currentLocation: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        },
        // 2. Overwrite the serviceAreas array with the new zone 
        // (Or use $push if you want to support multiple cities)
        serviceAreas: [newServiceArea], 
        lastLocationUpdate: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Location and Service Area updated successfully',
      data: {
        currentLocation: updatedTechnician.currentLocation,
        serviceAreas: updatedTechnician.serviceAreas
      }
    });
  } catch (error) {
    console.error('Update technician location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Upload Technician Documents
export const uploadTechnicianDocuments = async (req, res) => {
  try {
    const technician = req.user;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to cloud storage
    const cloudinaryResponse = await uploadToCloudinary(req.file.path);
    const documentUrl = cloudinaryResponse.secure_url;

    // Update technician documents
    const updateData = {};
    updateData[`documents.${documentType}`] = {
      url: documentUrl,
      uploadedAt: new Date(),
      status: 'pending_verification'
    };

    const updatedTechnician = await Technician.findByIdAndUpdate(
      technician._id,
      updateData,
      { new: true }
    );

    // Notify admin for verification
    await sendEmail(
      process.env.ADMIN_EMAIL || 'admin@repairum.com',
      'New Document for Verification',
      `
        Technician: ${technician.firstName} ${technician.lastName} (${technician.email})
        Document Type: ${documentType}
        Document URL: ${documentUrl}
        Uploaded: ${new Date().toISOString()}
      `
    );

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully. Pending verification.',
      data: {
        documentUrl,
        documentType,
        technician: updatedTechnician
      }
    });
  } catch (error) {
    console.error('Upload technician documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Update Bank Details
export const updateBankDetails = async (req, res) => {
  try {
    const technician = req.user;
    
    const { accountHolder, accountNumber, bankName, ifscCode } = req.body.bankDetails || {};

    if (!accountNumber || !ifscCode) {
       return res.status(400).json({ success: false, message: "Missing required bank fields" });
    }

    const updatedTechnician = await Technician.findByIdAndUpdate(
      technician._id,
      {
        bankDetails: {
          accountHolder,
          accountNumber,
          bankName,
          ifscCode,
          isVerified: false 
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Bank details updated and pending verification',
      data: { technician: updatedTechnician }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Technician Earnings
export const getTechnicianEarnings = async (req, res) => {
  try {
    const technician = req.user;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Build query
    const query = { technician: technician._id };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const earnings = await Booking.find({
      ...query,
      status: 'completed',
      paymentStatus: 'paid'
    })
      .select('finalAmount createdAt paymentMethod')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments({
      ...query,
      status: 'completed',
      paymentStatus: 'paid'
    });

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, booking) => sum + booking.finalAmount, 0);
    const commission = totalEarnings * 0.1; // 10% commission
    const netEarnings = totalEarnings - commission;

    res.status(200).json({
      success: true,
      message: 'Technician earnings retrieved successfully',
      data: {
        earnings: createPaginationResponse(earnings, parseInt(page), limitNum, total),
        summary: {
          totalEarnings,
          commission,
          netEarnings,
          totalBookings: total
        }
      }
    });
  } catch (error) {
    console.error('Get technician earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician earnings',
      error: error.message
    });
  }
};

// Get Technician Statistics
export const getTechnicianStatistics = async (req, res) => {
  try {
    const technician = req.user;

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { technician: technician._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { technician: technician._id } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$score' }
        }
      }
    ]);

    // Get monthly booking trends
    const monthlyTrends = await Booking.aggregate([
      {
        $match: {
          technician: technician._id,
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last 12 months
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statistics = {
      bookings: bookingStats,
      reviews: reviewStats[0] || { totalReviews: 0, averageRating: 0 },
      monthlyTrends,
      currentRating: technician.rating,
      totalBookings: technician.totalBookings,
      completedBookings: technician.completedBookings,
      cancelledBookings: technician.cancelledBookings,
      totalEarnings: technician.earnings
    };

    res.status(200).json({
      success: true,
      message: 'Technician statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get technician statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technician statistics',
      error: error.message
    });
  }
};

// Respond to Service Request
export const respondToServiceRequest = async (req, res) => {
  try {
    const technician = req.user;
    const { bookingId, response } = req.body; // response: 'accept' or 'reject'

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is no longer pending'
      });
    }

    if (response === 'accept') {
      booking.status = 'confirmed';
      booking.technician = technician._id;
      booking.assignedAt = new Date();
    } else if (response === 'reject') {
      booking.status = 'cancelled';
      booking.cancelledBy = 'technician';
      booking.cancelledAt = new Date();
    }

    await booking.save();

    // Notify user
    const User = await import('../models/User.js').then(m => m.default);
    const user = await User.findById(booking.user);
    if (user) {
      await sendPushNotification(
        user._id,
        'Service Request Updated',
        `Your booking ${booking.bookingId} has been ${response === 'accept' ? 'accepted' : 'rejected'}`
      );

      await sendTemplatedEmail(user.email, 'serviceRequestResponse', {
        firstName: user.firstName,
        bookingId: booking.bookingId,
        response,
        technicianName: `${technician.firstName} ${technician.lastName}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Service request ${response === 'accept' ? 'accepted' : 'rejected'} successfully`,
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Respond to service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to service request',
      error: error.message
    });
  }
};

export default {
  getTechnicianProfile,
  updateTechnicianProfile,
  updateAvatar,
  getTechnicianBookings,
  updateBookingStatus,
  getTechnicianReviews,
  updateTechnicianAvailability,
  updateTechnicianLocation,
  uploadTechnicianDocuments,
  updateBankDetails,
  getTechnicianEarnings,
  getTechnicianStatistics,
  respondToServiceRequest,
};