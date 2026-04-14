# Technician Notification System

This document describes the enhanced notification system for technicians in the Repairum project, featuring real-time Socket.io notifications and comprehensive notification management.

## Overview

The notification system provides:
- Real-time notifications via Socket.io
- Email notifications
- SMS notifications (mock implementation)
- In-app notifications with read/unread status
- Technician-specific notification handling
- Automatic notification triggers for various events

## Architecture

### Backend Components

#### 1. Enhanced Socket.io Configuration (`server.js`)
- Room-based communication for different user types
- Real-time event handling for technicians
- Location and status tracking
- Error handling and connection management

#### 2. Notification Model (`models/Notification.js`)
- Comprehensive notification schema
- Multiple delivery channels (in-app, email, SMS, push)
- Read status tracking
- Expiration handling
- Real-time Socket.io integration

#### 3. Technician Notification Service (`services/technicianNotificationService.js`)
- Specialized notification handlers for technicians
- New booking request notifications
- Booking assignment notifications
- Payment notifications
- Review notifications
- Verification status notifications
- Nearby technician detection

#### 4. Notification Controller (`controllers/notificationController.js`)
- REST API endpoints for notification management
- Pagination and filtering
- Mark as read functionality
- Notification statistics
- Bulk operations

#### 5. Auto Notification Middleware (`middleware/autoNotification.js`)
- Automatic notification triggers
- Event-based notification sending
- Booking status change notifications
- Payment notifications
- Review notifications
- Verification status updates

#### 6. Notification Routes (`routes/notification.js`)
- Complete API endpoints
- Authentication middleware
- Technician-specific endpoints

### Frontend Components

#### 1. Notification Service (`src/services/notificationService.js`)
- Socket.io client integration
- Real-time event handling
- Toast notifications
- Custom event handlers
- Notification sound alerts

## Features

### Real-time Notifications

#### Technician Events
- **New Booking Requests**: Notifies nearby technicians about new bookings
- **Booking Assignment**: Alerts when a booking is assigned
- **Booking Status Changes**: Updates on booking progress
- **Payment Received**: Notifications for completed payments
- **New Reviews**: Alerts for customer reviews
- **Verification Status**: Updates on profile verification

#### User Events
- **Technician Assignment**: Notifies when a technician is assigned
- **Booking Updates**: Status changes and progress
- **Service Completion**: Alerts when service is completed

### Notification Types

1. **Booking Notifications**
   - Created, confirmed, assigned, in_progress, completed, cancelled
   - Priority-based urgency (emergency bookings marked as urgent)

2. **Payment Notifications**
   - Payment initiated, successful, failed, refunded
   - Technician earnings updates

3. **System Notifications**
   - Profile verification status
   - System updates and announcements

4. **Review Notifications**
   - New customer reviews
   - Rating updates

### Delivery Channels

1. **In-App**: Real-time Socket.io notifications
2. **Email**: HTML email templates
3. **SMS**: Mock implementation (integrate with Twilio/MessageBird)
4. **Push**: Firebase Cloud Messaging (mock implementation)

## API Endpoints

### Notification Management
```
GET    /api/notifications              # Get user notifications
GET    /api/notifications/stats       # Get notification statistics
GET    /api/notifications/:id         # Get single notification
PATCH  /api/notifications/:id/read     # Mark as read
PATCH  /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/:id         # Delete notification
```

### Technician-Specific
```
GET    /api/notifications/technician/my-notifications  # Get technician notifications
POST   /api/notifications/technicians/notify           # Send bulk notifications
POST   /api/notifications/send                         # Send custom notification
```

## Socket.io Events

### Client to Server
```javascript
// Join user rooms
socket.emit('join', { userId, userType });

// Technician status updates
socket.emit('update_technician_status', { technicianId, status });
socket.emit('update_location', { technicianId, coordinates });

// Notification actions
socket.emit('mark_notification_read', { notificationId, userId });
```

### Server to Client
```javascript
// General notifications
socket.on('new_notification', (notification) => {});
socket.on('notification_read', (data) => {});
socket.on('all_notifications_read', (data) => {});

// Technician-specific
socket.on('new_booking_request', (data) => {});
socket.on('booking_assigned', (data) => {});
socket.on('booking_status_changed', (data) => {});
socket.on('payment_received', (data) => {});
socket.on('new_review', (data) => {});

// Status updates
socket.on('technician_online', (data) => {});
socket.on('technician_status_updated', (data) => {});
```

## Integration Examples

### Backend Integration

#### Automatic Notifications
```javascript
import { triggerNotification } from '../middleware/autoNotification.js';

// In booking controller after booking creation
await triggerNotification('booking_created', {
  booking: newBooking
});

// After booking assignment
await triggerNotification('booking_assigned', {
  booking: updatedBooking,
  technicianId: technician._id
});
```

#### Manual Notifications
```javascript
import TechnicianNotificationService from '../services/technicianNotificationService.js';

// Notify technicians about new booking
await TechnicianNotificationService.notifyNewBookingRequest(booking);

// Notify about payment
await TechnicianNotificationService.notifyPaymentReceived(payment, technicianId);
```

### Frontend Integration

#### Initialize Notification Service
```javascript
import notificationService from './services/notificationService.js';

// Initialize after login
const user = { id: '123', role: 'technician' };
notificationService.initialize(user);

// Listen for custom events
notificationService.on('new_booking_request', (data) => {
  // Handle new booking request
  console.log('New booking request:', data);
});
```

#### Update Technician Status
```javascript
// Update online status
notificationService.updateTechnicianStatus('online');

// Update location
notificationService.updateLocation([longitude, latitude]);
```

## Configuration

### Environment Variables
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Repairum <noreply@repairum.com>

# Socket.io Configuration
FRONTEND_URL=http://localhost:5173

# Notification Settings
NOTIFICATION_BASE_URL=http://localhost:5173/api/notifications
NOTIFICATION_TOKEN=your-notification-token
```

### Frontend Environment
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## Notification Templates

The system includes comprehensive email templates for:
- Booking confirmations
- Technician assignments
- Payment receipts
- Verification status updates
- Welcome emails
- Password resets

## Best Practices

### Performance
- Use fire-and-forget for non-critical notifications
- Implement proper error handling
- Use pagination for notification lists
- Clean up expired notifications automatically

### Security
- Validate recipient permissions
- Sanitize notification content
- Use secure Socket.io connections
- Implement rate limiting

### User Experience
- Use appropriate notification priorities
- Provide clear action buttons
- Allow users to customize notification preferences
- Implement notification grouping for multiple items

## Testing

### Unit Tests
```javascript
// Test notification creation
const notification = await Notification.createNotification({
  title: 'Test Notification',
  message: 'Test message',
  recipient: userId,
  recipientModel: 'User'
});

// Test technician notification service
const notifications = await TechnicianNotificationService.notifyNewBookingRequest(booking);
```

### Integration Tests
```javascript
// Test Socket.io connection
const socket = io('http://localhost:5000');
socket.emit('join', { userId, userType });

// Test real-time notifications
socket.on('new_notification', (notification) => {
  expect(notification.title).toBe('Test Notification');
});
```

## Troubleshooting

### Common Issues

1. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify server URL
   - Ensure authentication tokens are valid

2. **Notification Not Received**
   - Verify user is in correct room
   - Check recipient model and ID
   - Review notification channel settings

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check email configuration
   - Review email templates

### Debug Logging
```javascript
// Enable debug logging
console.log('Socket connected:', socket.connected);
console.log('Current rooms:', socket.rooms);

// Monitor notification creation
console.log('Notification created:', notification);
```

## Future Enhancements

1. **Push Notifications**: Integrate with Firebase Cloud Messaging
2. **SMS Integration**: Connect with Twilio or MessageBird
3. **Notification Preferences**: User-specific notification settings
4. **Analytics**: Notification engagement tracking
5. **Mobile App**: Native mobile notification support
6. **Web Push**: Browser push notifications

## Support

For issues or questions about the notification system:
1. Check the server logs for error messages
2. Verify Socket.io connection status
3. Review notification configuration
4. Test with different user roles and permissions
