import React, { useEffect } from 'react';
import NotificationDropdown from '../components/NotificationDropdown';
import NotificationsPage from '../pages/NotificationsPage';
import NotificationSettingsPage from '../pages/NotificationSettingsPage';
import notificationService from '../services/notificationService';
import { useNotifications } from '../hooks/useNotifications';

// Example of how to integrate the notification system into your main app
const NotificationIntegrationExample = () => {
  const { user } = useAuth(); // Assuming you have an auth hook
  const { 
    fetchNotifications, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();

  useEffect(() => {
    // Initialize notification service when user is available
    if (user) {
      notificationService.initialize(user);
      
      // Set up custom event listeners
      setupCustomNotificationListeners();
    }

    // Cleanup on unmount
    return () => {
      if (notificationService) {
        notificationService.disconnect();
      }
    };
  }, [user]);

  const setupCustomNotificationListeners = () => {
    // Listen for new booking requests (technician specific)
    notificationService.on('new_booking_request', (data) => {
      console.log('New booking request received:', data);
      
      // Custom logic for handling new bookings
      handleNewBookingRequest(data);
    });

    // Listen for booking assignment
    notificationService.on('booking_assigned', (data) => {
      console.log('Booking assigned:', data);
      
      // Custom logic for booking assignment
      handleBookingAssigned(data);
    });

    // Listen for payment notifications
    notificationService.on('payment_received', (data) => {
      console.log('Payment received:', data);
      
      // Custom logic for payment notifications
      handlePaymentReceived(data);
    });

    // Listen for review notifications
    notificationService.on('new_review', (data) => {
      console.log('New review received:', data);
      
      // Custom logic for new reviews
      handleNewReview(data);
    });

    // Listen for verification status updates
    notificationService.on('verification_status_updated', (data) => {
      console.log('Verification status updated:', data);
      
      // Custom logic for verification updates
      handleVerificationStatusUpdated(data);
    });

    // Listen for technician status updates
    notificationService.on('technician_status_updated', (data) => {
      console.log('Technician status updated:', data);
      
      // Update technician status in UI
      updateTechnicianStatus(data);
    });

    // Listen for location updates
    notificationService.on('technician_location_updated', (data) => {
      console.log('Technician location updated:', data);
      
      // Update technician location in UI
      updateTechnicianLocation(data);
    });
  };

  const handleNewBookingRequest = (data) => {
    const { notification, booking } = data;
    
    // Example: Show custom alert for urgent bookings
    if (booking.priority === 'urgent' || booking.serviceType === 'emergency') {
      // Custom handling for urgent bookings
      showUrgentBookingAlert(booking);
    }
    
    // Example: Auto-accept if enabled in settings
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.autoAcceptBookings && booking.estimatedCost.total > 100) {
      // Auto-accept high-value bookings
      acceptBookingAutomatically(booking.id);
    }
  };

  const handleBookingAssigned = (data) => {
    const { notification, booking } = data;
    
    // Example: Navigate to booking details
    if (window.location.pathname !== `/bookings/${booking.id}`) {
      // Show navigation prompt
      showNavigationPrompt('Booking assigned', `You've been assigned booking ${booking.bookingId}`, () => {
        window.location.href = `/bookings/${booking.id}`;
      });
    }
    
    // Example: Update technician status to busy
    updateTechnicianStatus('busy');
  };

  const handlePaymentReceived = (data) => {
    const { notification, payment } = data;
    
    // Example: Show earnings update
    updateEarningsDisplay(payment.amount);
    
    // Example: Play celebration sound for large payments
    if (payment.amount > 1000) {
      playCelebrationSound();
    }
  };

  const handleNewReview = (data) => {
    const { notification, review } = data;
    
    // Example: Update rating display
    updateRatingDisplay(review.rating);
    
    // Example: Show review prompt
    if (review.rating >= 4) {
      showPositiveReviewPrompt(review);
    }
  };

  const handleVerificationStatusUpdated = (data) => {
    const { notification, verificationStatus } = data;
    
    // Example: Show verification status modal
    showVerificationStatusModal(verificationStatus);
    
    // Example: Enable/disable features based on verification
    if (verificationStatus === 'verified') {
      enableVerifiedFeatures();
    } else if (verificationStatus === 'rejected') {
      showVerificationRejectionGuidance(data.reason);
    }
  };

  const updateTechnicianStatus = (data) => {
    const { technicianId, status } = data;
    
    // Example: Update UI to reflect technician status
    if (technicianId === user.id) {
      // Update current user's status
      setCurrentUserStatus(status);
    } else {
      // Update other technician's status in list/map
      updateTechnicianInList(technicianId, status);
    }
  };

  const updateTechnicianLocation = (data) => {
    const { technicianId, coordinates } = data;
    
    // Example: Update technician location on map
    if (technicianId === user.id) {
      // Update current user's location on map
      updateCurrentUserLocation(coordinates);
    } else {
      // Update other technician's location on map
      updateTechnicianLocationOnMap(technicianId, coordinates);
    }
  };

  // Helper functions for the above handlers
  const showUrgentBookingAlert = (booking) => {
    // Custom alert for urgent bookings
    alert(`🚨 URGENT: New ${booking.serviceType} booking request in ${booking.serviceAddress.city}!`);
  };

  const acceptBookingAutomatically = async (bookingId) => {
    try {
      // Call your booking acceptance API
      await acceptBooking(bookingId);
      console.log('Automatically accepted booking:', bookingId);
    } catch (error) {
      console.error('Failed to auto-accept booking:', error);
    }
  };

  const showNavigationPrompt = (title, message, onConfirm) => {
    if (window.confirm(`${title}: ${message}\n\nNavigate to booking details?`)) {
      onConfirm();
    }
  };

  const updateEarningsDisplay = (amount) => {
    // Update earnings display in UI
    const currentEarnings = parseFloat(localStorage.getItem('totalEarnings') || '0');
    const newEarnings = currentEarnings + amount;
    localStorage.setItem('totalEarnings', newEarnings.toString());
    
    // Trigger UI update
    window.dispatchEvent(new CustomEvent('earningsUpdated', { detail: { amount, total: newEarnings } }));
  };

  const playCelebrationSound = () => {
    // Play celebration sound for large payments
    const audio = new Audio('/sounds/celebration.mp3');
    audio.play().catch(err => console.log('Could not play celebration sound:', err));
  };

  const updateRatingDisplay = (rating) => {
    // Update rating display in UI
    window.dispatchEvent(new CustomEvent('ratingUpdated', { detail: { rating } }));
  };

  const showPositiveReviewPrompt = (review) => {
    // Show prompt to share positive review
    if (window.confirm(`Great! You received a ${review.rating}-star review. Share this achievement?`)) {
      shareAchievement('Received 5-star review!');
    }
  };

  const showVerificationStatusModal = (status) => {
    // Show modal with verification status
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Verification Status</h3>
        <p>Your verification status is: <strong>${status}</strong></p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const showVerificationRejectionGuidance = (reason) => {
    // Show guidance for rejected verification
    alert(`Verification was rejected. Reason: ${reason}\n\nPlease update your documents and try again.`);
  };

  const enableVerifiedFeatures = () => {
    // Enable features that require verification
    window.dispatchEvent(new CustomEvent('verificationStatusChanged', { detail: { verified: true } }));
  };

  const setCurrentUserStatus = (status) => {
    // Update current user's status
    localStorage.setItem('technicianStatus', status);
    notificationService.updateTechnicianStatus(status);
  };

  const updateTechnicianInList = (technicianId, status) => {
    // Update technician status in list/map view
    window.dispatchEvent(new CustomEvent('technicianStatusUpdated', { 
      detail: { technicianId, status } 
    }));
  };

  const updateCurrentUserLocation = (coordinates) => {
    // Update current user's location
    localStorage.setItem('currentLocation', JSON.stringify(coordinates));
    notificationService.updateLocation(coordinates);
  };

  const updateTechnicianLocationOnMap = (technicianId, coordinates) => {
    // Update technician location on map
    window.dispatchEvent(new CustomEvent('technicianLocationUpdated', { 
      detail: { technicianId, coordinates } 
    }));
  };

  const shareAchievement = (achievement) => {
    // Share achievement on social media or platform
    if (navigator.share) {
      navigator.share({
        title: 'Repairum Achievement',
        text: `I just achieved: ${achievement}!`,
        url: window.location.href
      });
    }
  };

  // Example of how to use the components in your main app
  return (
    <div className="app">
      {/* Header with notification dropdown */}
      <header className="app-header">
        <div className="header-left">
          <h1>Repairum</h1>
        </div>
        <div className="header-right">
          <NotificationDropdown />
          <button onClick={() => window.location.href = '/notifications'}>
            View All Notifications
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="app-main">
        {/* Your existing app content */}
        <div className="dashboard">
          <h2>Dashboard</h2>
          {/* Your dashboard content */}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <button onClick={() => window.location.href = '/notifications/settings'}>
          Notification Settings
        </button>
      </footer>
    </div>
  );
};

// Example of how to integrate with routing
const AppRoutes = () => {
  return (
    <Router>
      <Route path="/" element={<NotificationIntegrationExample />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
      {/* Your other routes */}
    </Router>
  );
};

export default NotificationIntegrationExample;
