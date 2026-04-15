import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, X, Settings, Trash2 } from 'lucide-react';
import notificationService from '../services/notificationService';
import  useNotifications  from '../hooks/useNotifications';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();
    
    // Set up notification service listeners
    notificationService.on('new_notification', handleNewNotification);
    notificationService.on('notification_read', handleNotificationRead);
    notificationService.on('all_notifications_read', handleAllNotificationsRead);
    notificationService.on('notification_deleted', handleNotificationDeleted);
    notificationService.on('notification_count_updated', updateNotificationCount);

    return () => {
      // Clean up listeners
      notificationService.off('new_notification', handleNewNotification);
      notificationService.off('notification_read', handleNotificationRead);
      notificationService.off('all_notifications_read', handleAllNotificationsRead);
      notificationService.off('notification_deleted', handleNotificationDeleted);
      notificationService.off('notification_count_updated', updateNotificationCount);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetchNotifications({ limit: 10, unreadOnly: false });
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    setUnreadCount(prev => prev + 1);
  };

  const handleNotificationRead = (data) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === data.notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleAllNotificationsRead = (data) => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
    );
    setUnreadCount(0);
  };

  const handleNotificationDeleted = (data) => {
    setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
    if (data.isRead === false) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const updateNotificationCount = async () => {
    try {
      const response = await fetchNotifications({ limit: 1 });
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to update notification count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await markAsRead(notificationId);
      notificationService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} });
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <div className="notification-icon booking">📋</div>;
      case 'payment':
        return <div className="notification-icon payment">💰</div>;
      case 'system':
        return <div className="notification-icon system">⚙️</div>;
      case 'success':
        return <div className="notification-icon success">✅</div>;
      case 'error':
        return <div className="notification-icon error">❌</div>;
      case 'warning':
        return <div className="notification-icon warning">⚠️</div>;
      default:
        return <div className="notification-icon default">📢</div>;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button 
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <div className="notification-bell-wrapper">
            <BellRing className="notification-bell" size={20} />
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </div>
        ) : (
          <Bell className="notification-bell" size={20} />
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-content">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <Check size={14} />
                  Mark all read
                </button>
              )}
              <button 
                className="notification-settings-btn"
                onClick={() => window.location.href = '/notifications/settings'}
                title="Notification settings"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">🔔</div>
                <p>No notifications yet</p>
                <span>You'll see notifications here when they arrive</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-left">
                      {getNotificationIcon(notification.type)}
                      <div className="notification-text">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="notification-right">
                      {!notification.isRead && (
                        <button
                          className="mark-read-btn"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        className="delete-notification-btn"
                        onClick={(e) => handleDelete(notification.id, e)}
                        title="Delete notification"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {notification.actionText && (
                    <div className="notification-action">
                      {notification.actionText}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn"
                onClick={() => window.location.href = '/notifications'}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
