import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellRing, Check, X, Settings } from 'lucide-react';
import notificationService from '../services/notificationService';
import useNotifications from '../hooks/useNotifications';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef(null);
  
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // 🔥 Memoize loadNotifications so it doesn't trigger effect loops
  const loadNotifications = useCallback(async (isSilent = false) => {
    if (isFetching) return;
    if (!isSilent) setIsFetching(true);
    
    try {
      const response = await fetchNotifications({ limit: 10, unreadOnly: false });
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsFetching(false);
    }
  }, [fetchNotifications, isFetching]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main Listener Setup
  useEffect(() => {
    loadNotifications();

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationRead = (data) => {
      setNotifications(prev => 
        prev.map(n => n.id === data.notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
    };

    // Attach listeners
    notificationService.on('new_notification', handleNewNotification);
    notificationService.on('notification_read', handleNotificationRead);
    notificationService.on('all_notifications_read', handleAllNotificationsRead);
    // Removed 'notification_count_updated' to prevent redundant network calls

    return () => {
      notificationService.off('new_notification', handleNewNotification);
      notificationService.off('notification_read', handleNotificationRead);
      notificationService.off('all_notifications_read', handleAllNotificationsRead);
    };
  }, []); // Empty dependency array ensures this only runs ONCE

  const handleMarkAsRead = async (notificationId, event) => {
    if (event) event.stopPropagation();
    try {
      await markAsRead(notificationId);
      // Logic is handled locally by the handleNotificationRead listener or state update
      notificationService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
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
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) window.location.href = notification.actionUrl;
    setIsOpen(false);
  };

  // UI Helper Components (Keep your existing switch and logic here)
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
    const diffMins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button className="notification-button" onClick={() => setIsOpen(!isOpen)}>
        {unreadCount > 0 ? (
          <div className="notification-bell-wrapper">
            <BellRing className="notification-bell" size={20} />
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </div>
        ) : <Bell className='notification-bell' size={20} />}
      </button>

      {isOpen && (
        <div className="notification-dropdown-content">
          <div className="notification-header">
            <h3 className="text-[10px] font-black uppercase tracking-widest">Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="mark-all-read-btn" title="Mark all as read">
                  <Check size={14} /> Clear All
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
          <div className="notification-footer">
            <button className="view-all-btn" onClick={() => window.location.href = '/notifications'}>
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;