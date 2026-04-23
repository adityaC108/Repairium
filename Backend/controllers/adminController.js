import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendEmail, sendPushNotification, sendTemplatedEmail } from '../middleware/notification.js';
import { paginate, createPaginationResponse, uploadToCloudinary } from '../utils/helpers.js';

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    // req.admin should be populated by your protectAdmin middleware
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'NODE_NOT_FOUND: Admin registry entry missing'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: { admin }
    });
  } catch (error) {
    console.error('GET_ADMIN_PROFILE_ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile',
      error: error.message
    });
  }
};

// Get User Detail
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Fetch User with security exclusions
    const user = await User.findById(userId)
      .select('-password -__v -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'NODE_NOT_FOUND: The requested User identity does not exist in the registry.'
      });
    }

    // 2. Telemetry: Fetch recent mission history for this user
    // We import Booking dynamically to avoid circular dependencies if any
    const Booking = await import('../models/Booking.js').then(m => m.default);
    const recentBookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('appliance', 'name brand category')
      .populate('technician', 'firstName lastName')
      .lean();

    res.status(200).json({
      success: true,
      message: 'User identity reconciled successfully',
      data: {
        profile: user,
        activity: {
          recentBookings,
          totalBookings: await Booking.countDocuments({ user: userId })
        }
      }
    });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'REGISTRY_FETCH_FAILED',
      error: error.message
    });
  }
};

// Get Technician
export const getTechnicianById = async (req, res) => {
  try {
    const { technicianId } = req.params;

    // 1. Fetch Technician with all professional metadata
    const technician = await Technician.findById(technicianId)
      .select('-password -__v')
      .lean();

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'FLEET_NODE_NOT_FOUND: The requested Technician identity is not active in the registry.'
      });
    }

    // 2. Telemetry: Fetch Mission Statistics & Recent History
    const Booking = await import('../models/Booking.js').then(m => m.default);
    
    // Fetch last 10 missions
    const missionHistory = await Booking.find({ technician: technicianId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName')
      .populate('appliance', 'name brand')
      .lean();

    // Calculate dynamic stats for the HUD
    const stats = {
      totalMissions: await Booking.countDocuments({ technician: technicianId }),
      completedMissions: await Booking.countDocuments({ technician: technicianId, status: 'completed' }),
      pendingMissions: await Booking.countDocuments({ technician: technicianId, status: 'pending' }),
    };

    res.status(200).json({
      success: true,
      message: 'Technician telemetry reconciled',
      data: {
        profile: technician,
        stats,
        history: missionHistory
      }
    });
  } catch (error) {
    console.error('Get Technician By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'FLEET_REGISTRY_FETCH_FAILED',
      error: error.message
    });
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = req.user;
    
    const updates = { ...req.body };

    // 🛡️ SECURITY_GATE: Strip unauthorized or sensitive fields
    const restrictedFields = [
      'password', 
      'role', 
      'permissions', 
      '_id', 
      'email', // Email usually requires a separate verification protocol
      'createdAt', 
      'updatedAt', 
      '__v'
    ];

    restrictedFields.forEach(field => delete updates[field]);

    // Handle empty update body
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'UPDATE_REJECTED: No valid fields provided for reconciliation'
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      admin._id,
      { $set: updates },
      { 
        new: true, 
        runValidators: true,
        context: 'query' 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Registry_Node updated successfully',
      data: {
        admin: updatedAdmin
      }
    });
  } catch (error) {
    console.error('UPDATE_ADMIN_PROFILE_ERROR:', error);
    
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'VALIDATION_FAILED',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile telemetry',
      error: error.message
    });
  }
};

/**
 * @desc    Update Admin Avatar Telemetry
 * @route   PUT /api/admin/profile/avatar
 * @access  Private/Admin
 */
export const updateAdminAvatar = async (req, res) => {
  try {
    const admin = req.user; // Extracted from protectAdmin middleware

    // 1. Validate File Existence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'UPLOAD_ERROR: No image file detected in request buffer'
      });
    }

    // 2. Asset Upload to Cloudinary
    // We use a dedicated folder 'admin_avatars' for clear asset partitioning
    const cloudinaryResponse = await uploadToCloudinary(req.file.path, 'admin_avatars');
    const avatarUrl = cloudinaryResponse.secure_url;

    // 3. Registry Reconciliation (Update Database)
    const updatedAdmin = await Admin.findByIdAndUpdate(
      admin._id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: 'NODE_NOT_FOUND: Admin record lost during sync'
      });
    }

    // 4. Dispatch Success
    res.status(200).json({
      success: true,
      message: 'Avatar_Node updated successfully',
      data: {
        avatar: avatarUrl,
        admin: updatedAdmin
      }
    });
  } catch (error) {
    console.error('UPDATE_ADMIN_AVATAR_ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reconcile avatar telemetry',
      error: error.message
    });
  }
};

// Get Dashboard Statistics
export const getDashboardStatistics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Technician statistics
    const totalTechnicians = await Technician.countDocuments({ isActive: true });
    const verifiedTechnicians = await Technician.countDocuments({
      isActive: true,
      verificationStatus: 'verified'
    });
    const pendingVerification = await Technician.countDocuments({
      isActive: true,
      verificationStatus: 'pending'
    });

    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Revenue statistics
    // 1. Calculate TOTAL Gross Revenue (All-time paid)
    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'paid' // 🔥 Use dot notation for nested fields
        }
      },
      {
        $group: {
          _id: null,
          // 🔥 Sum the actual paid amount from the payment object
          total: { $sum: '$payment.paidAmount' }
        }
      }
    ]);

    // 2. Calculate MONTHLY Revenue (Last 30 days)
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'paid',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.paidAmount' }
        }
      }
    ]);

    // Appliance statistics
    const Appliance = await import('../models/Appliance.js').then(m => m.default);
    const totalAppliances = await Appliance.countDocuments();
    const activeAppliances = await Appliance.countDocuments({ isActive: true });

    const statistics = {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth
      },
      technicians: {
        total: totalTechnicians,
        verified: verifiedTechnicians,
        pendingVerification: pendingVerification
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthlyRevenue[0]?.total || 0
      },
      appliances: {
        total: totalAppliances,
        active: activeAppliances
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.isActive = status === 'active';
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const users = await User.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: createPaginationResponse(users, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Get All Technicians
export const getAllTechnicians = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, verificationStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = {};
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const technicians = await Technician.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Technician.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Technicians retrieved successfully',
      data: createPaginationResponse(technicians, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get all technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve technicians',
      error: error.message
    });
  }
};

// Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = {};
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
      .populate('technician', 'firstName lastName email')
      .populate('appliance', 'name brand model category')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: createPaginationResponse(bookings, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message
    });
  }
};

// Verify Technician
export const verifyTechnician = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { verificationStatus, rejectionReason } = req.body;

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    technician.verificationStatus = verificationStatus;
    technician.verificationRejectionReason = rejectionReason || null;
    technician.isVerified = verificationStatus === 'verified';
    technician.verificationToken = undefined;

    await technician.save();

    // Send notification to technician
    await sendPushNotification(
      technician._id,
      'Verification Status Updated',
      `Your account has been ${verificationStatus}`
    );

    await sendTemplatedEmail(technician.email, 'technicianVerification', {
      firstName: technician.firstName,
      verificationStatus,
      rejectionReason
    });

    res.status(200).json({
      success: true,
      message: `Technician ${verificationStatus} successfully`,
      data: {
        technician
      }
    });
  } catch (error) {
    console.error('Verify technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify technician',
      error: error.message
    });
  }
};

// Manage User Status
export const manageUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Send notification to user
    await sendPushNotification(
      user._id,
      'Account Status Updated',
      `Your account has been ${isActive ? 'activated' : 'deactivated'}`
    );

    await sendTemplatedEmail(user.email, 'accountStatusUpdate', {
      firstName: user.firstName,
      status: isActive ? 'activated' : 'deactivated',
      reason
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Manage user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Manage Technician Status
export const manageTechnicianStatus = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { isActive, reason } = req.body;

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    technician.isActive = isActive;
    await technician.save();

    // Send notification to technician
    await sendPushNotification(
      technician._id,
      'Account Status Updated',
      `Your account has been ${isActive ? 'activated' : 'deactivated'}`
    );

    await sendTemplatedEmail(technician.email, 'accountStatusUpdate', {
      firstName: technician.firstName,
      status: isActive ? 'activated' : 'deactivated',
      reason
    });

    res.status(200).json({
      success: true,
      message: `Technician ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        technician
      }
    });
  } catch (error) {
    console.error('Manage technician status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update technician status',
      error: error.message
    });
  }
};

// Get Reports
export const getReports = async (req, res) => {
  try {
    const { type } = req.query;

    let data = [];

    // 🟢 REVENUE REPORT
    if (type === "revenue") {
      const bookings = await Booking.find({ status: "completed" });

      const revenueMap = {};

      bookings.forEach((b) => {
        const date = new Date(b.createdAt);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!revenueMap[key]) revenueMap[key] = 0;
        revenueMap[key] += b.amount || 0;
      });

      data = Object.keys(revenueMap).map((key) => ({
        label: key,
        value: revenueMap[key],
      }));
    }

    // 🟢 BOOKINGS REPORT
    else if (type === "bookings") {
      const bookings = await Booking.find();

      const statusMap = {};

      bookings.forEach((b) => {
        const status = b.status;

        if (!statusMap[status]) statusMap[status] = 0;
        statusMap[status]++;
      });

      data = Object.keys(statusMap).map((key) => ({
        label: key,
        value: statusMap[key],
      }));
    }

    // 🟢 USERS REPORT
    else if (type === "users") {
      const users = await User.find();

      const monthMap = {};

      users.forEach((u) => {
        const date = new Date(u.createdAt);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!monthMap[key]) monthMap[key] = 0;
        monthMap[key]++;
      });

      data = Object.keys(monthMap).map((key) => ({
        label: key,
        value: monthMap[key],
      }));
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Specific Technician Document
export const verifyTechnicianDocument = async (req, res) => {
  try {
    const { technicianId, documentType } = req.params;
    const { status, reason } = req.body; // documentType: 'aadharCard', 'panCard', 'bankDetails', etc.

    const validDocs = ['aadharCard', 'panCard', 'addressProof', 'policeVerification', 'bankDetails'];
    if (!validDocs.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    const updatePath = documentType === 'bankDetails'
      ? { "bankDetails.isVerified": status === 'verified' }
      : { [`documents.${documentType}.status`]: status, [`documents.${documentType}.rejectionReason`]: reason || null };

    const technician = await Technician.findByIdAndUpdate(
      technicianId,
      { $set: updatePath },
      { new: true }
    );

    if (!technician) return res.status(404).json({ success: false, message: 'Technician not found' });

    // Internal Logic: If all critical docs are verified, auto-promote isVerified status
    const docs = technician.documents;
    const allVerified = docs.aadharCard.status === 'approved' &&
      docs.panCard.status === 'approved' &&
      technician.bankDetails.isVerified;

    if (allVerified && technician.verificationStatus !== 'verified') {
      technician.verificationStatus = 'verified';
      technician.isVerified = true;
      await technician.save();
    }

    // Send targeted notification
    await sendPushNotification(technician._id, 'Document Update', `Your ${documentType} has been ${status}`);
    // Inside verifyTechnicianDocument controller
    await sendTemplatedEmail(technician.email, 'documentsVerified', {
      firstName: technician.firstName,
      documentType: documentType.replace(/([A-Z])/g, ' $1').toUpperCase(), // Formats 'aadharCard' to 'AADHAR CARD'
      status: status.toUpperCase(), // 'APPROVED' or 'REJECTED'
      reason: reason || 'Your document met all verification protocols.',
      systemAction: status.toLowerCase() === 'approved' ? 'REGISTRY_SYNC_COMPLETE' : 'RE-UPLOAD_REQUIRED'
    });

    res.status(200).json({ success: true, message: `Document ${status} successfully`, data: technician });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAdminProfile,
  updateAdminProfile,
  getDashboardStatistics,
  getAllUsers,
  getAllTechnicians,
  getAllBookings,
  verifyTechnician,
  manageUserStatus,
  manageTechnicianStatus,
  getReports,
  verifyTechnicianDocument,
  getUserById,
  getTechnicianById,
  updateAdminAvatar
};