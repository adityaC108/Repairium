import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendEmail, sendTemplatedEmail } from '../middleware/notification.js';
import { paginate, createPaginationResponse } from '../utils/helpers.js';

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { user } = req;

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const { user } = req;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;
    delete updates.verificationToken;
    delete updates.resetPasswordToken;
    delete updates.resetPasswordExpires;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.__v;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { user: user._id };
    if (status) {
      query.status = status;
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const bookings = await Booking.find(query)
      .populate('technician', 'firstName lastName email phone rating')
      .populate('appliance', 'name brand model category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'User bookings retrieved successfully',
      data: createPaginationResponse(bookings, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user bookings',
      error: error.message
    });
  }
};

// Get User Reviews
export const getUserReviews = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const reviews = await Review.find({ user: user._id })
      .populate('technician', 'firstName lastName avatar')
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      message: 'User reviews retrieved successfully',
      data: createPaginationResponse(reviews, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user reviews',
      error: error.message
    });
  }
};

// Create User Review
export const createUserReview = async (req, res) => {
  try {
    const { user } = req;
    const { bookingId, technicianId, score, review } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({ _id: bookingId, user: user._id });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to you'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create new review
    const newReview = new Review({
      user: user._id,
      technician: technicianId,
      booking: bookingId,
      score,
      review
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    console.error('Create user review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Update User Preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { user } = req;
    const { preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { preferences },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// Get User Notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    // Build query
    const query = { recipient: user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const Notification = await import('../models/Notification.js').then(m => m.default);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: createPaginationResponse(notifications, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

// Mark Notifications as Read
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { user } = req;
    const { notificationIds } = req.body;

    const Notification = await import('../models/Notification.js').then(m => m.default);
    await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        recipient: user._id 
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read successfully'
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

// Delete User Account
export const deleteUserAccount = async (req, res) => {
  try {
    const { user } = req;
    const { password, confirmation } = req.body;

    // Verify password
    const userWithPassword = await User.findById(user._id).select('+password');
    const isPasswordValid = await userWithPassword.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify confirmation text
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid confirmation text. Please type "DELETE_MY_ACCOUNT" exactly.'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      user: user._id,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active bookings. Please cancel all active bookings first.'
      });
    }

    // Soft delete user account
    await User.findByIdAndUpdate(user._id, {
      isActive: false,
      deletedAt: new Date()
    });

    // Send confirmation email
    await sendTemplatedEmail(user.email, 'accountDeletion', {
      firstName: user.firstName
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

// Get User Statistics
export const getUserStatistics = async (req, res) => {
  try {
    const { user } = req;

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { user: user._id } },
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
      { $match: { user: user._id } },
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
          user: user._id,
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last 12 months
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statistics = {
      bookings: bookingStats,
      reviews: reviewStats[0] || { totalReviews: 0, averageRating: 0 },
      monthlyTrends
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error: error.message
    });
  }
};

// Get User Service History
export const getUserServiceHistory = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Build query
    const query = { user: user._id };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const serviceHistory = await Booking.find(query)
      .populate('technician', 'firstName lastName email rating')
      .populate('appliance', 'name brand model category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Service history retrieved successfully',
      data: createPaginationResponse(serviceHistory, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get user service history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service history',
      error: error.message
    });
  }
};

// Report Issue
export const reportIssue = async (req, res) => {
  try {
    const { user } = req;
    const { type, description, bookingId, technicianId } = req.body;

    // Create issue report
    const issueReport = {
      user: user._id,
      type, // 'booking', 'payment', 'technician', 'technical'
      description,
      status: 'pending',
      bookingId,
      technicianId,
      createdAt: new Date()
    };

    // Save to database (you might want to create a separate IssueReport model)
    // For now, we'll send email notification

    // Send email to admin
    await sendEmail(
      process.env.ADMIN_EMAIL || 'admin@repairum.com',
      'New Issue Report',
      `
        User: ${user.firstName} ${user.lastName} (${user.email})
        Type: ${type}
        Description: ${description}
        Booking ID: ${bookingId || 'N/A'}
        Technician ID: ${technicianId || 'N/A'}
        Reported: ${new Date().toISOString()}
      `
    );

    // Send confirmation to user
    await sendTemplatedEmail(user.email, 'issueReportConfirmation', {
      firstName: user.firstName,
      issueId: issueReport._id
    });

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: {
        issueId: issueReport._id
      }
    });
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report issue',
      error: error.message
    });
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserReviews,
  createUserReview,
  updateUserPreferences,
  getUserNotifications,
  markNotificationsAsRead,
  deleteUserAccount,
  getUserStatistics,
  getUserServiceHistory,
  reportIssue
};