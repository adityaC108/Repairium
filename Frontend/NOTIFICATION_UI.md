# Frontend Notification System UI

This document describes the complete notification system UI implementation for the Repairum frontend, providing real-time notifications and comprehensive notification management for technicians and users.

## Overview

The frontend notification system provides:
- Real-time Socket.io notifications
- Interactive notification dropdown
- Comprehensive notification management page
- Customizable notification settings
- Technician-specific features
- Responsive design with accessibility support

## Components

### 1. NotificationDropdown (`src/components/NotificationDropdown.jsx`)

**Purpose**: Compact notification widget for header/navigation areas

**Features**:
- Real-time notification count badge
- Dropdown with recent notifications
- Mark as read/delete functionality
- Priority-based styling
- Click-to-action support
- Responsive design

**Props**: None (self-contained component)

**Usage**:
```jsx
import NotificationDropdown from '../components/NotificationDropdown';

// In your header component
<NotificationDropdown />
```

**Events**:
- `new_notification` - New notification received
- `notification_read` - Notification marked as read
- `all_notifications_read` - All notifications marked as read
- `notification_deleted` - Notification deleted

### 2. NotificationsPage (`src/pages/NotificationsPage.jsx`)

**Purpose**: Full-featured notification management interface

**Features**:
- Paginated notification list
- Advanced filtering (type, status, priority)
- Search functionality
- Bulk operations (mark all read, delete selected)
- Notification statistics
- Real-time updates
- Export functionality

**Usage**:
```jsx
import NotificationsPage from '../pages/NotificationsPage';

// In your routing
<Route path="/notifications" element={<NotificationsPage />} />
```

**Features Details**:
- **Filters**: Type, status, priority, search
- **Bulk Actions**: Mark all as read, delete selected
- **Statistics**: Total count, unread count, by-type breakdown
- **Pagination**: Navigate through large notification sets
- **Real-time**: Live updates via Socket.io

### 3. NotificationSettingsPage (`src/pages/NotificationSettingsPage.jsx`)

**Purpose**: Comprehensive notification preferences management

**Features**:
- General notification settings
- Channel preferences (in-app, email, push, SMS)
- Notification type preferences
- Priority level settings
- Quiet hours configuration
- Technician-specific settings
- Import/export settings

**Usage**:
```jsx
import NotificationSettingsPage from '../pages/NotificationSettingsPage';

// In your routing
<Route path="/notifications/settings" element={<NotificationSettingsPage />} />
```

**Settings Categories**:
- **General**: Enable/disable, sound, duration
- **Channels**: In-app, email, push, SMS preferences
- **Types**: Booking, payment, review, system notifications
- **Priority**: Urgent, high, medium, low priority filters
- **Quiet Hours**: Do-not-disturb time periods
- **Technician**: Auto-accept, location sharing, online status

### 4. useNotifications Hook (`src/hooks/useNotifications.js`)

**Purpose**: Custom React hook for notification API operations

**Features**:
- All notification API calls
- Error handling and loading states
- Bulk operations
- Search and export functionality
- Technician-specific endpoints

**Usage**:
```jsx
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { 
    fetchNotifications, 
    markAsRead, 
    deleteNotification,
    getNotificationStats 
  } = useNotifications();

  // Use the functions...
};
```

**Available Functions**:
- `fetchNotifications(params)` - Get notifications with pagination/filters
- `getNotification(id)` - Get single notification
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `getNotificationStats()` - Get notification statistics
- `sendCustomNotification(data)` - Send custom notification
- `getTechnicianNotifications(params)` - Get technician notifications
- `notifyTechnicians(data)` - Notify multiple technicians
- `bulkMarkAsRead(ids)` - Bulk mark as read
- `bulkDelete(ids)` - Bulk delete
- `searchNotifications(term, params)` - Search notifications
- `exportNotifications(format)` - Export notifications

### 5. NotificationService (`src/services/notificationService.js`)

**Purpose**: Socket.io client service for real-time notifications

**Features**:
- Real-time Socket.io connection
- Event handling and dispatching
- Toast notifications
- Sound alerts
- Custom event listeners
- Technician status management

**Usage**:
```jsx
import notificationService from '../services/notificationService';

// Initialize after login
const user = { id: '123', role: 'technician' };
notificationService.initialize(user);

// Listen for events
notificationService.on('new_booking_request', (data) => {
  console.log('New booking:', data);
});

// Emit events
notificationService.updateTechnicianStatus('online');
```

**Socket Events**:
- **Connection**: `connect`, `disconnect`
- **Notifications**: `new_notification`, `notification_read`, `all_notifications_read`
- **Booking**: `new_booking_request`, `booking_assigned`, `booking_status_changed`
- **Payment**: `payment_received`
- **Review**: `new_review`
- **Verification**: `verification_status_updated`
- **Technician**: `technician_online`, `technician_status_updated`, `technician_location_updated`

## Integration Guide

### 1. Basic Setup

**Install Dependencies**:
```bash
npm install lucide-react react-toastify axios socket.io-client
```

**Import Styles**:
```jsx
// In your main App.jsx or index.css
import 'react-toastify/dist/ReactToastify.css';
import './components/NotificationDropdown.css';
import './pages/NotificationsPage.css';
import './pages/NotificationSettingsPage.css';
```

### 2. Integration Steps

**Step 1: Add to Main App**
```jsx
import React, { useEffect } from 'react';
import NotificationDropdown from './components/NotificationDropdown';
import notificationService from './services/notificationService';

const App = ({ user }) => {
  useEffect(() => {
    if (user) {
      notificationService.initialize(user);
    }
  }, [user]);

  return (
    <div className="app">
      <header>
        <h1>Repairum</h1>
        <NotificationDropdown />
      </header>
      {/* Your app content */}
    </div>
  );
};
```

**Step 2: Add Routing**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
      {/* Your other routes */}
    </Routes>
  </BrowserRouter>
);
```

**Step 3: Technician-Specific Integration**
```jsx
// In technician dashboard
import { useNotifications } from '../hooks/useNotifications';

const TechnicianDashboard = () => {
  const { getTechnicianNotifications } = useNotifications();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadTechnicianNotifications();
    
    // Listen for new booking requests
    notificationService.on('new_booking_request', handleNewBooking);
    
    return () => {
      notificationService.off('new_booking_request', handleNewBooking);
    };
  }, []);

  const loadTechnicianNotifications = async () => {
    try {
      const response = await getTechnicianNotifications({ status: 'unread' });
      setBookings(response.data.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleNewBooking = (data) => {
    // Handle new booking request
    setBookings(prev => [data.booking, ...prev]);
  };

  return (
    <div>
      {/* Your technician dashboard content */}
    </div>
  );
};
```

## Styling

### CSS Architecture

**Component-Based Styling**:
- Each component has its own CSS file
- BEM-like naming convention
- Responsive design with mobile-first approach
- CSS custom properties for theming

**Key Features**:
- **Responsive**: Mobile, tablet, desktop breakpoints
- **Accessible**: Focus states, ARIA labels, keyboard navigation
- **Animated**: Smooth transitions and micro-interactions
- **Themed**: CSS variables for easy customization

### Customization

**CSS Variables**:
```css
:root {
  --notification-primary: #3b82f6;
  --notification-success: #10b981;
  --notification-warning: #f59e0b;
  --notification-error: #ef4444;
  --notification-bg: #ffffff;
  --notification-text: #111827;
  --notification-border: #e5e7eb;
}
```

## Features

### Real-Time Updates

**Socket.io Integration**:
- Automatic reconnection
- Room-based communication
- Event-driven updates
- Error handling and fallbacks

**Toast Notifications**:
- Priority-based styling
- Auto-dismissal
- Click handlers
- Sound integration

### Notification Types

**Booking Notifications**:
- New booking requests
- Assignment confirmations
- Status updates (in-progress, completed, cancelled)
- Rescheduling alerts

**Payment Notifications**:
- Payment initiated
- Payment successful
- Payment failed
- Refund processed

**System Notifications**:
- Profile verification
- System maintenance
- Feature updates
- Security alerts

### Technician Features

**Location Sharing**:
- Real-time location updates
- Privacy controls
- Service area management

**Status Management**:
- Online/offline status
- Busy/available status
- Automatic status detection

**Booking Management**:
- Auto-accept settings
- Radius-based notifications
- Priority filtering

## Accessibility

### WCAG Compliance

**Keyboard Navigation**:
- Tab order management
- Focus indicators
- Keyboard shortcuts

**Screen Reader Support**:
- ARIA labels
- Live regions for announcements
- Semantic HTML structure

**Visual Accessibility**:
- High contrast support
- Resizable text
- Focus indicators
- Color-blind friendly design

## Performance

### Optimization

**Component Optimization**:
- React.memo for expensive components
- useCallback for event handlers
- Lazy loading for large lists
- Virtual scrolling for thousands of items

**Network Optimization**:
- Request debouncing
- Response caching
- Batch operations
- Efficient pagination

### Memory Management**:
- Event listener cleanup
- Socket.io connection management
- Component unmounting
- Garbage collection

## Testing

### Unit Tests

**Component Testing**:
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationDropdown from '../NotificationDropdown';

describe('NotificationDropdown', () => {
  test('renders notification button', () => {
    render(<NotificationDropdown />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('shows notification count badge', () => {
    render(<NotificationDropdown />);
    // Mock notifications...
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

### Integration Tests

**Socket.io Testing**:
```jsx
import { render, waitFor } from '@testing-library/react';
import notificationService from '../services/notificationService';

describe('NotificationService', () => {
  test('connects to socket server', async () => {
    const mockSocket = { on: jest.fn(), emit: jest.fn() };
    global.io = jest.fn(() => mockSocket);

    const user = { id: '123', role: 'user' };
    notificationService.initialize(user);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });
  });
});
```

## Troubleshooting

### Common Issues

**Socket.io Connection Issues**:
- Check server URL configuration
- Verify CORS settings
- Ensure authentication tokens are valid
- Check network connectivity

**Notification Not Showing**:
- Verify component initialization
- Check event listener setup
- Confirm user authentication
- Review browser console for errors

**Performance Issues**:
- Implement virtual scrolling for large lists
- Use React.memo for expensive renders
- Optimize re-renders with useCallback
- Monitor memory usage

### Debug Tools

**Browser Console**:
```javascript
// Enable debug logging
localStorage.setItem('debug-notifications', 'true');

// Monitor socket events
notificationService.on('*', (event, data) => {
  console.log(`Socket event: ${event}`, data);
});
```

**Network Tab**:
- Monitor Socket.io WebSocket connection
- Check API request/response
- Verify authentication headers
- Monitor notification delivery

## Browser Support

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Feature Detection
```javascript
// Check for WebSocket support
const supportsWebSocket = 'WebSocket' in window;

// Check for notification support
const supportsNotifications = 'Notification' in window;

// Check for geolocation support
const supportsGeolocation = 'geolocation' in navigator;
```

## Security

### Data Protection
- Input sanitization
- XSS prevention
- CSRF protection
- Secure WebSocket connections

### Privacy Controls
- Notification preferences
- Data export/deletion
- Location sharing controls
- Activity status management

## Future Enhancements

### Planned Features
1. **Push Notifications**: Native mobile app support
2. **Email Templates**: Customizable email designs
3. **Analytics**: Notification engagement tracking
4. **AI Categorization**: Smart notification categorization
5. **Voice Notifications**: Text-to-speech support
6. **Offline Support**: Service worker integration

### Performance Improvements
1. **Web Workers**: Background processing
2. **Cache Strategies**: Intelligent caching
3. **Bundle Optimization**: Code splitting
4. **CDN Integration**: Asset optimization

This comprehensive notification system provides a robust foundation for real-time communication between users, technicians, and the platform, ensuring timely updates and excellent user experience.
