import TechnicianNotificationService from '../services/technicianNotificationService.js';
import { sendBookingNotification, sendPaymentNotification } from './notification.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Technician from '../models/Technician.js';

// Middleware to automatically send notifications when booking status changes
export const bookingNotificationMiddleware = async (req, res, next) => {
  // Store original res.json function
  const originalJson = res.json;
  
  // Override res.json to intercept the response
  res.json = async function(data) {
    // Only send notifications on successful responses for booking updates
    if (res.statusCode >= 200 && res.statusCode < 300 && req.path.includes('/bookings')) {
      try {
        await handleBookingNotification(req, data);
      } catch (error) {
        console.error('Failed to send booking notification:', error);
        // Don't fail the request if notification fails
      }
    }
    
    // Call original json function
    return originalJson.call(this, data);
  };
  
  next();
};

// Handle booking notifications based on the request
const handleBookingNotification = async (req, responseData) => {
  const { bookingId } = req.params;
  const { user } = req;
  
  if (!bookingId) return;
  
  try {
    const booking = await Booking.findById(bookingId)
      .populate('user')
      .populate('technician')
      .populate('appliance');
    
    if (!booking) return;
    
    // Determine the notification type based on the request method and path
    if (req.method === 'PATCH' || req.method === 'PUT') {
      const oldStatus = req.body.oldStatus;
      const newStatus = booking.status;
      
      if (oldStatus && newStatus && oldStatus !== newStatus) {
        // Send status change notifications
        await sendBookingNotification(booking, newStatus, { oldStatus });
        
        // Notify technician if assigned
        if (booking.technician) {
          await TechnicianNotificationService.notifyBookingStatusChange(
            booking, 
            booking.technician._id, 
            oldStatus, 
            newStatus
          );
        }
      }
    }
    
    // Handle booking creation
    if (req.method === 'POST' && responseData.success) {
      await sendBookingNotification(booking, 'created');
    }
    
  } catch (error) {
    console.error('Error in handleBookingNotification:', error);
  }
};

// Middleware to automatically send notifications when payment status changes
export const paymentNotificationMiddleware = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = async function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.path.includes('/payments')) {
      try {
        await handlePaymentNotification(req, data);
      } catch (error) {
        console.error('Failed to send payment notification:', error);
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Handle payment notifications
const handlePaymentNotification = async (req, responseData) => {
  const { paymentId } = req.params;
  
  if (!paymentId) return;
  
  try {
    const payment = await Payment.findById(paymentId)
      .populate('user')
      .populate('technician')
      .populate('booking');
    
    if (!payment) return;
    
    // Send payment notification based on status
    await sendPaymentNotification(payment, payment.status);
    
    // Notify technician about payment received
    if (payment.status === 'paid' && payment.technician) {
      await TechnicianNotificationService.notifyPaymentReceived(payment, payment.technician._id);
    }
    
  } catch (error) {
    console.error('Error in handlePaymentNotification:', error);
  }
};

// Middleware to automatically send notifications when reviews are created
export const reviewNotificationMiddleware = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = async function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300 && 
        req.method === 'POST' && req.path.includes('/reviews')) {
      try {
        await handleReviewNotification(req, data);
      } catch (error) {
        console.error('Failed to send review notification:', error);
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Handle review notifications
const handleReviewNotification = async (req, responseData) => {
  if (!responseData.success || !responseData.data) return;
  
  try {
    const review = responseData.data.review;
    
    if (review && review.technician) {
      await TechnicianNotificationService.notifyNewReview(review, review.technician);
    }
    
  } catch (error) {
    console.error('Error in handleReviewNotification:', error);
  }
};

// Middleware to automatically send notifications when technician verification status changes
export const technicianVerificationMiddleware = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = async function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300 && 
        req.path.includes('/technicians') && req.method === 'PATCH') {
      try {
        await handleTechnicianVerificationNotification(req, data);
      } catch (error) {
        console.error('Failed to send technician verification notification:', error);
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Handle technician verification notifications
const handleTechnicianVerificationNotification = async (req, responseData) => {
  const { technicianId } = req.params;
  
  if (!technicianId) return;
  
  try {
    const technician = await Technician.findById(technicianId);
    
    if (!technician) return;
    
    // Check if verification status changed
    if (req.body.verificationStatus) {
      const newStatus = req.body.verificationStatus;
      const oldStatus = technician.verificationStatus;
      
      if (oldStatus !== newStatus) {
        await TechnicianNotificationService.notifyVerificationStatus(
          technicianId, 
          newStatus, 
          req.body.rejectionReason
        );
      }
    }
    
  } catch (error) {
    console.error('Error in handleTechnicianVerificationNotification:', error);
  }
};

// Combined middleware for all automatic notifications
export const autoNotificationMiddleware = [
  bookingNotificationMiddleware,
  paymentNotificationMiddleware,
  reviewNotificationMiddleware,
  technicianVerificationMiddleware
];

// Helper function to trigger notifications manually (for use in controllers)
export const triggerNotification = async (type, data) => {
  try {
    switch (type) {
      case 'booking_created':
        if (data.booking) {
          await sendBookingNotification(data.booking, 'created');
          await TechnicianNotificationService.notifyNewBookingRequest(data.booking);
        }
        break;
        
      case 'booking_assigned':
        if (data.booking && data.technicianId) {
          await sendBookingNotification(data.booking, 'assigned');
          await TechnicianNotificationService.notifyBookingAssigned(data.booking, data.technicianId);
        }
        break;
        
      case 'booking_status_changed':
        if (data.booking && data.technicianId && data.oldStatus && data.newStatus) {
          await sendBookingNotification(data.booking, data.newStatus);
          await TechnicianNotificationService.notifyBookingStatusChange(
            data.booking, 
            data.technicianId, 
            data.oldStatus, 
            data.newStatus
          );
        }
        break;
        
      case 'payment_received':
        if (data.payment && data.technicianId) {
          await sendPaymentNotification(data.payment, 'paid');
          await TechnicianNotificationService.notifyPaymentReceived(data.payment, data.technicianId);
        }
        break;
        
      case 'review_created':
        if (data.review && data.technicianId) {
          await TechnicianNotificationService.notifyNewReview(data.review, data.technicianId);
        }
        break;
        
      case 'verification_status_changed':
        if (data.technicianId && data.status) {
          await TechnicianNotificationService.notifyVerificationStatus(
            data.technicianId, 
            data.status, 
            data.reason
          );
        }
        break;
        
      default:
        console.warn(`Unknown notification type: ${type}`);
    }
  } catch (error) {
    console.error('Error triggering notification:', error);
  }
};

// Socket.io event handlers for real-time notifications
export const setupSocketNotificationHandlers = (io) => {
  // Handle technician joining their room
  io.on('connection', (socket) => {
    socket.on('technician_join', (technicianId) => {
      socket.join(`technician_${technicianId}`);
      socket.join('technicians'); // General technicians room
      console.log(`Technician ${technicianId} joined their room`);
    });
    
    // Handle technician status updates
    socket.on('technician_status_update', async (data) => {
      try {
        const { technicianId, status, coordinates } = data;
        
        // Update technician in database
        await Technician.findByIdAndUpdate(technicianId, {
          isOnline: status === 'online',
          lastActive: new Date(),
          ...(coordinates && { currentLocation: { type: 'Point', coordinates } })
        });
        
        // Broadcast to all clients
        socket.broadcast.emit('technician_status_updated', {
          technicianId,
          status,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Error updating technician status:', error);
      }
    });
    
    // Handle location updates
    socket.on('location_update', async (data) => {
      try {
        const { technicianId, coordinates } = data;
        
        await Technician.findByIdAndUpdate(technicianId, {
          currentLocation: { type: 'Point', coordinates },
          lastActive: new Date()
        });
        
        socket.broadcast.emit('technician_location_updated', {
          technicianId,
          coordinates,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error('Error updating technician location:', error);
      }
    });
  });
};
