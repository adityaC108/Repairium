import { sendNotification } from '../middleware/notification.js';
import Technician from '../models/Technician.js';
import Booking from '../models/Booking.js';

class TechnicianNotificationService {
  // Notify technicians about new booking requests in their area
  static async notifyNewBookingRequest(booking) {
    try {
      // Find technicians in the service area
      const nearbyTechnicians = await this.findNearbyTechnicians(booking.serviceAddress.coordinates);
      
      const notifications = [];
      
      for (const technician of nearbyTechnicians) {
        // Skip if technician is not online or not verified
        if (!technician.isOnline || !technician.isVerified) continue;
        
        const notificationData = {
          title: 'New Booking Request',
          message: `New ${booking.serviceType} booking request ${booking.bookingId} in ${booking.serviceAddress.city}`,
          type: 'booking',
          priority: booking.serviceType === 'emergency' ? 'urgent' : 'medium',
          recipient: technician._id,
          recipientModel: 'Technician',
          relatedEntity: {
            entityType: 'Booking',
            entityId: booking._id
          },
          channels: ['in_app', 'push'],
          actionUrl: `/bookings/${booking._id}`,
          actionText: 'View Booking',
          metadata: {
            bookingId: booking.bookingId,
            serviceType: booking.serviceType,
            urgency: booking.priority,
            address: booking.serviceAddress,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime,
            estimatedCost: booking.estimatedCost.total
          }
        };
        
        const notification = await sendNotification(notificationData);
        notifications.push(notification);
        
        // Emit real-time notification to specific technician
        if (global.io) {
          global.io.to(`technician_${technician._id}`).emit('new_booking_request', {
            notification: {
              id: notification._id,
              title: notification.title,
              message: notification.message,
              priority: notification.priority,
              actionUrl: notification.actionUrl,
              createdAt: notification.createdAt
            },
            booking: {
              id: booking._id,
              bookingId: booking.bookingId,
              serviceType: booking.serviceType,
              priority: booking.priority,
              address: booking.serviceAddress,
              preferredDate: booking.preferredDate,
              preferredTime: booking.preferredTime,
              estimatedCost: booking.estimatedCost.total
            }
          });
        }
      }
      
      console.log(`Sent new booking notifications to ${notifications.length} technicians`);
      return notifications;
    } catch (error) {
      console.error('Error notifying technicians about new booking:', error);
      throw error;
    }
  }
  
  // Notify technician when assigned to a booking
  static async notifyBookingAssigned(booking, technicianId) {
    try {
      const notificationData = {
        title: 'Booking Assigned',
        message: `You have been assigned to booking ${booking.bookingId}`,
        type: 'booking',
        priority: 'high',
        recipient: technicianId,
        recipientModel: 'Technician',
        relatedEntity: {
          entityType: 'Booking',
          entityId: booking._id
        },
        channels: ['in_app', 'email', 'push', 'sms'],
        actionUrl: `/bookings/${booking._id}`,
        actionText: 'View Booking',
        metadata: {
          bookingId: booking.bookingId,
          serviceType: booking.serviceType,
          address: booking.serviceAddress,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          customerName: booking.user?.firstName || 'Customer'
        }
      };
      
      const notification = await sendNotification(notificationData);
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`technician_${technicianId}`).emit('booking_assigned', {
          notification: {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            actionUrl: notification.actionUrl,
            createdAt: notification.createdAt
          },
          booking: {
            id: booking._id,
            bookingId: booking.bookingId,
            address: booking.serviceAddress,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime
          }
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Error notifying technician about booking assignment:', error);
      throw error;
    }
  }
  
  // Notify technician about booking status changes
  static async notifyBookingStatusChange(booking, technicianId, oldStatus, newStatus) {
    try {
      const statusMessages = {
        confirmed: 'Booking has been confirmed by customer',
        in_progress: 'Service has been started',
        completed: 'Service has been completed successfully',
        cancelled: 'Booking has been cancelled'
      };
      
      const notificationData = {
        title: `Booking ${newStatus.replace('_', ' ').toUpperCase()}`,
        message: statusMessages[newStatus] || `Booking status changed to ${newStatus}`,
        type: 'booking',
        priority: newStatus === 'cancelled' ? 'high' : 'medium',
        recipient: technicianId,
        recipientModel: 'Technician',
        relatedEntity: {
          entityType: 'Booking',
          entityId: booking._id
        },
        channels: ['in_app', 'push'],
        actionUrl: `/bookings/${booking._id}`,
        actionText: 'View Booking',
        metadata: {
          bookingId: booking.bookingId,
          oldStatus,
          newStatus,
          timestamp: new Date()
        }
      };
      
      const notification = await sendNotification(notificationData);
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`technician_${technicianId}`).emit('booking_status_changed', {
          notification: {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            createdAt: notification.createdAt
          },
          booking: {
            id: booking._id,
            bookingId: booking.bookingId,
            oldStatus,
            newStatus
          }
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Error notifying technician about booking status change:', error);
      throw error;
    }
  }
  
  // Notify technician about payment received
  static async notifyPaymentReceived(payment, technicianId) {
    try {
      const notificationData = {
        title: 'Payment Received',
        message: `You have received payment of ${payment.amount.technicianShare} for completed service`,
        type: 'payment',
        priority: 'medium',
        recipient: technicianId,
        recipientModel: 'Technician',
        relatedEntity: {
          entityType: 'Payment',
          entityId: payment._id
        },
        channels: ['in_app', 'email', 'push'],
        actionUrl: '/earnings',
        actionText: 'View Earnings',
        metadata: {
          paymentId: payment.paymentId,
          amount: payment.amount.technicianShare,
          bookingId: payment.booking
        }
      };
      
      const notification = await sendNotification(notificationData);
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`technician_${technicianId}`).emit('payment_received', {
          notification: {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt
          },
          payment: {
            id: payment._id,
            amount: payment.amount.technicianShare,
            paymentId: payment.paymentId
          }
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Error notifying technician about payment:', error);
      throw error;
    }
  }
  
  // Notify technician about new review
  static async notifyNewReview(review, technicianId) {
    try {
      const notificationData = {
        title: 'New Review Received',
        message: `You received a ${review.rating}-star review`,
        type: 'system',
        priority: 'medium',
        recipient: technicianId,
        recipientModel: 'Technician',
        relatedEntity: {
          entityType: 'Review',
          entityId: review._id
        },
        channels: ['in_app', 'email'],
        actionUrl: `/reviews/${review._id}`,
        actionText: 'View Review',
        metadata: {
          reviewId: review._id,
          rating: review.rating,
          bookingId: review.booking
        }
      };
      
      const notification = await sendNotification(notificationData);
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`technician_${technicianId}`).emit('new_review', {
          notification: {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt
          },
          review: {
            id: review._id,
            rating: review.rating
          }
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Error notifying technician about new review:', error);
      throw error;
    }
  }
  
  // Notify technician about verification status
  static async notifyVerificationStatus(technicianId, status, reason = null) {
    try {
      const statusMessages = {
        verified: 'Your profile has been verified successfully',
        rejected: 'Your profile verification has been rejected',
        pending: 'Your profile verification is under review'
      };
      
      const notificationData = {
        title: `Profile ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: statusMessages[status] || `Profile verification status: ${status}`,
        type: 'system',
        priority: status === 'rejected' ? 'high' : 'medium',
        recipient: technicianId,
        recipientModel: 'Technician',
        channels: ['in_app', 'email'],
        actionUrl: '/profile',
        actionText: 'View Profile',
        metadata: {
          verificationStatus: status,
          reason: reason,
          timestamp: new Date()
        }
      };
      
      if (reason) {
        notificationData.message += `. Reason: ${reason}`;
      }
      
      const notification = await sendNotification(notificationData);
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`technician_${technicianId}`).emit('verification_status_updated', {
          notification: {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            createdAt: notification.createdAt
          },
          verificationStatus: status,
          reason
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Error notifying technician about verification status:', error);
      throw error;
    }
  }
  
  // Find nearby technicians based on booking location
  static async findNearbyTechnicians(coordinates, maxDistance = 10000) { // 10km default
    try {
      const technicians = await Technician.find({
        isVerified: true,
        isActive: true,
        isOnline: true,
        'serviceAreas.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
          }
        }
      }).select('_id firstName lastName email phone isOnline serviceAreas');
      
      return technicians;
    } catch (error) {
      console.error('Error finding nearby technicians:', error);
      return [];
    }
  }
  
  // Send bulk notifications to technicians
  static async sendBulkNotification(technicianIds, notificationData) {
    try {
      const notifications = [];
      
      for (const technicianId of technicianIds) {
        const data = {
          ...notificationData,
          recipient: technicianId,
          recipientModel: 'Technician'
        };
        
        const notification = await sendNotification(data);
        notifications.push(notification);
        
        // Emit real-time notification
        if (global.io) {
          global.io.to(`technician_${technicianId}`).emit('bulk_notification', {
            notification: {
              id: notification._id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              priority: notification.priority,
              createdAt: notification.createdAt
            }
          });
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }
}

export default TechnicianNotificationService;
