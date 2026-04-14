import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, CheckCheck, Trash2, Settings, Bell, Calendar, Clock, AlertCircle } from 'lucide-react';
import notificationService from '../services/notificationService';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: []
  });

  const { 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getNotificationStats 
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
    loadStats();
    
    // Set up notification service listeners
    notificationService.on('new_notification', handleNewNotification);
    notificationService.on('notification_read', handleNotificationRead);
    notificationService.on('all_notifications_read', handleAllNotificationsRead);
    notificationService.on('notification_deleted', handleNotificationDeleted);

    return () => {
      notificationService.off('new_notification', handleNewNotification);
      notificationService.off('notification_read', handleNotificationRead);
      notificationService.off('all_notifications_read', handleAllNotificationsRead);
      notificationService.off('notification_deleted', handleNotificationDeleted);
    };
  }, [pagination.current, filters, searchTerm]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications({
        page: pagination.current,
        limit: 20,
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined
      });

      if (response.success) {
        setNotifications(response.data.notifications);
        setFilteredNotifications(response.data.notifications);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getNotificationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setFilteredNotifications(prev => [notification, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      unread: prev.unread + 1
    }));
  };

  const handleNotificationRead = (data) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === data.notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      )
    );
    setFilteredNotifications(prev => 
      prev.map(n => 
        n.id === data.notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      )
    );
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1)
    }));
  };

  const handleAllNotificationsRead = (data) => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
    );
    setFilteredNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
    );
    setStats(prev => ({ ...prev, unread: 0 }));
  };

  const handleNotificationDeleted = (data) => {
    const deletedNotification = notifications.find(n => n.id === data.notificationId);
    setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
    setFilteredNotifications(prev => prev.filter(n => n.id !== data.notificationId));
    
    if (deletedNotification && !deletedNotification.isRead) {
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
  };

  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [searchTerm, notifications]);

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      notificationService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      const unreadSelected = Array.from(selectedNotifications).filter(id => {
        const notification = notifications.find(n => n.id === id);
        return notification && !notification.isRead;
      });

      await Promise.all(unreadSelected.map(id => markAsRead(id)));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Failed to mark selected as read:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Delete ${selectedNotifications.size} notification(s)?`)) {
      try {
        await Promise.all(Array.from(selectedNotifications).map(id => deleteNotification(id)));
        setSelectedNotifications(new Set());
      } catch (error) {
        console.error('Failed to delete selected notifications:', error);
      }
    }
  };

  const handleDeleteSingle = async (notificationId) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await deleteNotification(notificationId);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📋';
      case 'payment':
        return '💰';
      case 'system':
        return '⚙️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="priority-badge urgent">Urgent</span>;
      case 'high':
        return <span className="priority-badge high">High</span>;
      case 'medium':
        return <span className="priority-badge medium">Medium</span>;
      case 'low':
        return <span className="priority-badge low">Low</span>;
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          <div className="stats-summary">
            <span className="stat-item">
              <Bell size={16} />
              {stats.total} Total
            </span>
            <span className="stat-item unread">
              <AlertCircle size={16} />
              {stats.unread} Unread
            </span>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="settings-btn"
            onClick={() => window.location.href = '/notifications/settings'}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      <div className="notifications-controls">
        <div className="search-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payments</option>
              <option value="system">System</option>
              <option value="success">Success</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {selectedNotifications.size > 0 && (
          <div className="bulk-actions">
            <button 
              className="bulk-action-btn mark-read"
              onClick={handleMarkSelectedAsRead}
            >
              <Check size={16} />
              Mark as Read
            </button>
            <button 
              className="bulk-action-btn delete"
              onClick={handleDeleteSelected}
            >
              <Trash2 size={16} />
              Delete ({selectedNotifications.size})
            </button>
          </div>
        )}
      </div>

      <div className="notifications-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms or filters' 
                : 'You\'re all caught up! No notifications to show.'
              }
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            <div className="list-header">
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === filteredNotifications.length}
                  onChange={handleSelectAll}
                />
                <span>Select All</span>
              </label>
            </div>

            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''} ${notification.priority}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-card-content">
                  <div className="card-left">
                    <input
                      type="checkbox"
                      className="notification-checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="notification-icon-large">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-details">
                      <div className="notification-header-row">
                        <h3 className="notification-title">{notification.title}</h3>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          <Clock size={12} />
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.actionUrl && (
                          <span className="action-link">
                            View Details →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    {!notification.isRead && (
                      <button
                        className="action-btn mark-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(notification.id);
                      }}
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.current === 1}
            onClick={() => handlePageChange(pagination.current - 1)}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            className="pagination-btn"
            disabled={pagination.current === pagination.pages}
            onClick={() => handlePageChange(pagination.current + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
