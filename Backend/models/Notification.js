import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'booking', 'payment', 'system', 'push'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Recipient is required'],
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    enum: ['User', 'Technician', 'Admin'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Technician', 'Admin', 'System'],
    default: 'System'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Booking', 'Payment', 'User', 'Technician', 'Appliance']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    default: ['in_app']
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  deliveryStatus: {
    in_app: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      readAt: { type: Date }
    },
    email: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      error: { type: String },
      sentAt: { type: Date }
    },
    sms: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      error: { type: String },
      sentAt: { type: Date }
    },
    push: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      error: { type: String },
      sentAt: { type: Date }
    }
  },
  actionUrl: {
    type: String
  },
  actionText: {
    type: String,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipientModel: 1, recipient: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save middleware to update read status
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
    this.deliveryStatus.in_app.read = true;
    this.deliveryStatus.in_app.readAt = new Date();
  }
  
  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Trigger real-time notification via socket.io if available
  if (global.io && notification.channels.includes('in_app')) {
    global.io.to(notification.recipient.toString()).emit('new_notification', {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      createdAt: notification.createdAt
    });
  }
  
  return notification;
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.deliveryStatus.in_app.read = true;
  this.deliveryStatus.in_app.readAt = new Date();
  return this.save();
};

// Instance method to send via HTTP
notificationSchema.methods.sendViaHTTP = async function() {
  try {
    const axios = require('axios');
    const notificationUrl = process.env.NOTIFICATION_BASE_URL || 'http://localhost:3000/api/notifications';
    
    const payload = {
      id: this._id,
      title: this.title,
      message: this.message,
      type: this.type,
      priority: this.priority,
      recipient: this.recipient,
      recipientModel: this.recipientModel,
      actionUrl: this.actionUrl,
      actionText: this.actionText,
      metadata: this.metadata
    };
    
    const response = await axios.post(notificationUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NOTIFICATION_TOKEN || 'default-token'}`
      },
      timeout: 5000
    });
    
    if (response.status === 200) {
      this.status = 'sent';
      await this.save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to send notification via HTTP:', error);
    this.status = 'failed';
    await this.save();
    return false;
  }
};

export default mongoose.model('Notification', notificationSchema);
