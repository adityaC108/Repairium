import Notification from '../models/Notification.js';
import { sendNotification, sendBookingNotification, sendPaymentNotification } from '../middleware/notification.js';

// Get notifications for authenticated user
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, unreadOnly = false } = req.query;
    const userId = req.user.id;
    const userType = req.user.role || 'user';

    // Build query
    const query = {
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    };

    if (type) query.type = type;
    if (status) query.status = status;
    if (unreadOnly === 'true') query.isRead = false;

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedEntity.entityId')
      .populate('sender', 'firstName lastName email avatar');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get single notification details
export const getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.role || 'user';

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    }).populate('relatedEntity.entityId');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.role || 'user';

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    // Emit real-time update
    if (global.io) {
      global.io.to(userId).emit('notification_read', {
        notificationId: notification._id,
        userId: userId,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role || 'user';

    const result = await Notification.updateMany(
      {
        recipient: userId,
        recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1),
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          'deliveryStatus.in_app.read': true,
          'deliveryStatus.in_app.readAt': new Date()
        }
      }
    );

    // Emit real-time update
    if (global.io) {
      global.io.to(userId).emit('all_notifications_read', {
        userId: userId,
        count: result.modifiedCount,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.role || 'user';

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Emit real-time update
    if (global.io) {
      global.io.to(userId).emit('notification_deleted', {
        notificationId: notification._id,
        userId: userId,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role || 'user';

    const stats = await Notification.aggregate([
      {
        $match: {
          recipient: userId,
          recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    const totalNotifications = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    });

    const unreadNotifications = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1),
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: stats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

// Send custom notification (for admin/technician use)
export const sendCustomNotification = async (req, res) => {
  try {
    const { title, message, recipient, recipientModel, type = 'info', priority = 'medium' } = req.body;

    if (!title || !message || !recipient || !recipientModel) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, recipient, and recipientModel are required'
      });
    }

    const notificationData = {
      title,
      message,
      type,
      priority,
      recipient,
      recipientModel,
      sender: req.user.id,
      senderModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      channels: ['in_app', 'email']
    };

    const notification = await sendNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error sending custom notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

// Get technician-specific notifications
export const getTechnicianNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, urgency } = req.query;
    const technicianId = req.user.id;

    // Build query for technician notifications
    const query = {
      recipient: technicianId,
      recipientModel: 'Technician'
    };

    if (status) query.status = status;
    if (urgency) query.priority = urgency;

    // Get notifications for technicians (booking requests, payment updates, etc.)
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1, priority: -1 }) // Sort by time and priority
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedEntity.entityId', 'bookingId status preferredDate preferredDate serviceAddress')
      .populate('sender', 'firstName lastName email');

    const total = await Notification.countDocuments(query);
    const urgentCount = await Notification.countDocuments({
      ...query,
      priority: 'urgent',
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        urgentCount
      }
    });
  } catch (error) {
    console.error('Error fetching technician notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technician notifications',
      error: error.message
    });
  }
};

// Send booking notification to technicians
export const notifyTechnicians = async (req, res) => {
  try {
    const { bookingId, technicianIds, notificationType, message } = req.body;

    if (!bookingId || !technicianIds || !notificationType) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, technician IDs, and notification type are required'
      });
    }

    // Import booking model
    const Booking = (await import('../models/Booking.js')).default;
    const booking = await Booking.findById(bookingId).populate('user appliance');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const notifications = [];

    // Send notifications to all specified technicians
    for (const technicianId of technicianIds) {
      const notificationData = {
        title: `New ${notificationType} Request`,
        message: message || `New booking request ${booking.bookingId} in your area`,
        type: 'booking',
        priority: booking.serviceType === 'emergency' ? 'urgent' : 'medium',
        recipient: technicianId,
        recipientModel: 'Technician',
        relatedEntity: {
          entityType: 'Booking',
          entityId: booking._id
        },
        channels: ['in_app', 'email', 'push'],
        actionUrl: `/bookings/${booking._id}`,
        actionText: 'View Booking',
        metadata: {
          bookingId: booking.bookingId,
          serviceType: booking.serviceType,
          urgency: booking.priority,
          address: booking.serviceAddress,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime
        }
      };

      const notification = await sendNotification(notificationData);
      notifications.push(notification);
    }

    res.status(200).json({
      success: true,
      message: `Notifications sent to ${technicianIds.length} technicians`,
      data: notifications
    });
  } catch (error) {
    console.error('Error notifying technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to notify technicians',
      error: error.message
    });
  }
};
