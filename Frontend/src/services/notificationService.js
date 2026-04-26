import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.socket = null;
    this.user = null;
    this.notificationHandlers = new Map();
  }

  // Initialize socket connection
  initialize(user) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.user = user;
    console.log("notification", import.meta.env.VITE_SOCKET_URL)
    
    // Connect to Socket.io server
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(socketUrl, {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    // Set up event listeners
    this.setupEventListeners();
    
    // Join user-specific rooms
    this.joinUserRooms();
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to notification server');
      toast.success('Connected to real-time notifications');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      toast.warning('Disconnected from real-time notifications');
    });

    // Notification events
    this.socket.on('new_notification', (notification) => {
      this.handleNewNotification(notification);
    });

    this.socket.on('notification_read', (data) => {
      this.handleNotificationRead(data);
    });

    this.socket.on('all_notifications_read', (data) => {
      this.handleAllNotificationsRead(data);
    });

    this.socket.on('notification_deleted', (data) => {
      this.handleNotificationDeleted(data);
    });

    // Technician-specific events
    this.socket.on('new_booking_request', (data) => {
      this.handleNewBookingRequest(data);
    });

    this.socket.on('booking_assigned', (data) => {
      this.handleBookingAssigned(data);
    });

    this.socket.on('booking_status_changed', (data) => {
      this.handleBookingStatusChanged(data);
    });

    this.socket.on('booking_updated', (data) => {
      this.handleBookingUpdated(data);
    });

    this.socket.on('payment_received', (data) => {
      this.handlePaymentReceived(data);
    });

    this.socket.on('new_review', (data) => {
      this.handleNewReview(data);
    });

    this.socket.on('verification_status_updated', (data) => {
      this.handleVerificationStatusUpdated(data);
    });

    // Technician status events
    this.socket.on('technician_online', (data) => {
      this.handleTechnicianOnline(data);
    });

    this.socket.on('technician_status_updated', (data) => {
      this.handleTechnicianStatusUpdated(data);
    });

    this.socket.on('technician_location_updated', (data) => {
      this.handleTechnicianLocationUpdated(data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error');
    });
  }

  // Join user-specific rooms
  joinUserRooms() {
    if (!this.socket || !this.user) return;

    const userData = {
      userId: this.user.id,
      userType: this.user.role || 'user'
    };

    this.socket.emit('join', userData);
    
    // If technician, join technician-specific room
    if (userData.userType === 'technician') {
      this.socket.emit('technician_join', userData.userId);
    }
  }

  // Handle new notification
  handleNewNotification(notification) {
    // Show toast notification
    const toastType = this.getToastType(notification.type, notification.priority);
    
    toast[toastType](
      notification.message,
      {
        toastId: notification.id,
        onClick: () => this.handleNotificationClick(notification),
        autoClose: notification.priority === 'urgent' ? false : 5000
      }
    );

    // Trigger custom handlers
    this.triggerHandler('new_notification', notification);
    
    // Update notification count in UI
    this.updateNotificationCount();
  }

  // Handle new booking request (technician)
  handleNewBookingRequest(data) {
    const { notification, booking } = data;
    
    // Show urgent notification for new booking
    toast.error(
      `New ${booking.serviceType} booking request! ${booking.bookingId}`,
      {
        toastId: `booking_${booking.id}`,
        onClick: () => this.handleBookingClick(booking),
        autoClose: false,
        closeButton: true
      }
    );

    // Play sound for new booking (if enabled)
    this.playNotificationSound('new_booking');

    // Navigate to booking details if clicked
    this.handleBookingClick = (booking) => {
      // Navigate to technician booking list page
      window.location.href = '/technician/bookings';
    };

    // Trigger custom handlers
    this.triggerHandler('new_booking_request', data);
  }

  // Handle booking assigned (technician)
  handleBookingAssigned(data) {
    const { notification, booking } = data;
    
    toast.success(
      `Booking assigned: ${booking.bookingId}`,
      {
        toastId: `assigned_${booking.id}`,
        onClick: () => this.handleBookingClick(booking)
      }
    );

    this.triggerHandler('booking_assigned', data);
  }

  // Handle booking status change
  handleBookingStatusChanged(data) {
    const { notification, booking } = data;
    
    toast.info(
      `Booking ${booking.bookingId} status: ${booking.newStatus}`,
      {
        toastId: `status_${booking.id}`,
        onClick: () => this.handleBookingClick(booking)
      }
    );

    this.triggerHandler('booking_status_changed', data);
  }

  // Handle payment received (technician)
  handlePaymentReceived(data) {
    const { notification, payment } = data;
    
    toast.success(
      `Payment received: ${payment.amount}`,
      {
        toastId: `payment_${payment.id}`,
        onClick: () => this.handlePaymentClick(payment)
      }
    );

    this.triggerHandler('payment_received', data);
  }

  // Handle new review (technician)
  handleNewReview(data) {
    const { notification, review } = data;
    
    toast.info(
      `New ${review.rating}-star review received`,
      {
        toastId: `review_${review.id}`,
        onClick: () => this.handleReviewClick(review)
      }
    );

    this.triggerHandler('new_review', data);
  }

  // Handle verification status update
  handleVerificationStatusUpdated(data) {
    const { notification, verificationStatus, reason } = data;
    
    const message = reason ? 
      `Verification ${verificationStatus}: ${reason}` : 
      `Verification ${verificationStatus}`;
    
    const toastType = verificationStatus === 'verified' ? 'success' : 
                     verificationStatus === 'rejected' ? 'error' : 'info';
    
    toast[toastType](message, {
      toastId: 'verification_status',
      onClick: () => this.handleVerificationClick(data)
    });

    this.triggerHandler('verification_status_updated', data);
  }

  // Handle technician online status
  handleTechnicianOnline(data) {
    this.triggerHandler('technician_online', data);
  }

  // Handle technician status update
  handleTechnicianStatusUpdated(data) {
    this.triggerHandler('technician_status_updated', data);
  }

  // Handle technician location update
  handleTechnicianLocationUpdated(data) {
    this.triggerHandler('technician_location_updated', data);
  }

  // Handle notification read
  handleNotificationRead(data) {
    this.triggerHandler('notification_read', data);
    this.updateNotificationCount();
  }

  // Handle all notifications read
  handleAllNotificationsRead(data) {
    this.triggerHandler('all_notifications_read', data);
    this.updateNotificationCount();
  }

  // Handle notification deleted
  handleNotificationDeleted(data) {
    this.triggerHandler('notification_deleted', data);
    this.updateNotificationCount();
  }

  // Handle booking updates
  handleBookingUpdated(data) {
    this.triggerHandler('booking_updated', data);
  }

  // Get toast type based on notification type and priority
  getToastType(type, priority) {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    if (type === 'success') return 'success';
    if (type === 'error') return 'error';
    if (type === 'warning') return 'warning';
    return 'info';
  }

  // Handle notification click
  handleNotificationClick(notification) {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }

  // Handle booking click
  handleBookingClick(booking) {
    window.location.href = `technician/bookings/${booking.id}`;
  }

  // Handle payment click
  handlePaymentClick(payment) {
    window.location.href = '/technician/earnings';
  }

  // Handle review click
  handleReviewClick(review) {
    window.location.href = `/reviews/${review.id}`;
  }

  // Handle verification click
  handleVerificationClick(data) {
    window.location.href = '/profile';
  }

  // Play notification sound
  playNotificationSound(type) {
    if (!localStorage.getItem('notificationSoundEnabled')) return;
    
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }

  // Update notification count
  updateNotificationCount() {
    // This would typically update a Redux store or context
    this.triggerHandler('notification_count_updated');
  }

  // Register custom event handler
  on(event, handler) {
    if (!this.notificationHandlers.has(event)) {
      this.notificationHandlers.set(event, []);
    }
    this.notificationHandlers.get(event).push(handler);
  }

  // Remove custom event handler
  off(event, handler) {
    if (this.notificationHandlers.has(event)) {
      const handlers = this.notificationHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Trigger custom handlers
  triggerHandler(event, data) {
    if (this.notificationHandlers.has(event)) {
      this.notificationHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in notification handler:', error);
        }
      });
    }
  }

  // Emit events to server
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Update technician status
  updateTechnicianStatus(status) {
    this.emit('update_technician_status', {
      technicianId: this.user.id,
      status
    });
  }

  // Update location
  updateLocation(coordinates) {
    this.emit('update_location', {
      technicianId: this.user.id,
      coordinates
    });
  }

  // Mark notification as read
  markNotificationRead(notificationId) {
    this.emit('mark_notification_read', {
      notificationId,
      userId: this.user._id
    });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
