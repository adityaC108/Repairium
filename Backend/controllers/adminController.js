import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendEmail, sendPushNotification, sendTemplatedEmail } from '../middleware/notification.js';
import { paginate, createPaginationResponse } from '../utils/helpers.js';

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const { admin } = req;

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile',
      error: error.message
    });
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { admin } = req;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.permissions;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.__v;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      admin._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: updatedAdmin
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
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
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
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
    const { technicianId } = req.params;
    const { documentType, status, reason } = req.body; // documentType: 'aadharCard', 'panCard', 'bankDetails', etc.

    const validDocs = ['aadharCard', 'panCard', 'addressProof', 'policeVerification', 'bankDetails'];
    if (!validDocs.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    const updatePath = documentType === 'bankDetails'
      ? { "bankDetails.isVerified": status === 'approved' }
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
    await sendTemplatedEmail(technician.email, 'documentStatusUpdate', {
      firstName: technician.firstName,
      documentType: documentType.replace(/([A-Z])/g, ' $1').toUpperCase(), // Formats 'aadharCard' to 'AADHAR CARD'
      status: status.toUpperCase(), // 'APPROVED' or 'REJECTED'
      reason: reason || 'Your document met all verification protocols.',
      systemAction: status === 'approved' ? 'REGISTRY_SYNC_COMPLETE' : 'RE-UPLOAD_REQUIRED'
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
  verifyTechnicianDocument
};