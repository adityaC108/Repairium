import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch notifications with pagination and filters
  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const {
        page = 1,
        limit = 10,
        type,
        status,
        priority,
        unreadOnly = false
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(unreadOnly && { unreadOnly: 'true' })
      });

      const response = await axios.get(
        `/api/notifications?${queryParams.toString()}`,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single notification
  const getNotification = useCallback(async (notificationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `/api/notifications/${notificationId}`,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark notification as read';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axios.patch(
        '/api/notifications/read-all',
        {},
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark all notifications as read';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await axios.delete(
        `/api/notifications/${notificationId}`,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback(async () => {
    try {
      const response = await axios.get(
        '/api/notifications/stats',
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch notification statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Send custom notification
  const sendCustomNotification = useCallback(async (notificationData) => {
    try {
      const response = await axios.post(
        '/api/notifications/send',
        notificationData,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get technician notifications
  const getTechnicianNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const {
        page = 1,
        limit = 10,
        status,
        urgency
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(urgency && { urgency })
      });

      const response = await axios.get(
        `/api/notifications/technician/my-notifications?${queryParams.toString()}`,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch technician notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Notify multiple technicians
  const notifyTechnicians = useCallback(async (notificationData) => {
    try {
      const response = await axios.post(
        '/api/notifications/technicians/notify',
        notificationData,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to notify technicians';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh notifications (useful after real-time updates)
  const refreshNotifications = useCallback(async (params = {}) => {
    // Clear any cached data and fetch fresh
    try {
      await fetchNotifications(params);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  }, [fetchNotifications]);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(
        '/api/notifications/stats',
        getAuthConfig()
      );

      return response.data?.data?.unread || 0;
    } catch (err) {
      console.error('Failed to get unread count:', err);
      return 0;
    }
  }, []);

  // Bulk operations
  const bulkMarkAsRead = useCallback(async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => markAsRead(id));
      await Promise.all(promises);
      return { success: true, count: notificationIds.length };
    } catch (err) {
      const errorMessage = 'Failed to mark notifications as read';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [markAsRead]);

  const bulkDelete = useCallback(async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => deleteNotification(id));
      await Promise.all(promises);
      return { success: true, count: notificationIds.length };
    } catch (err) {
      const errorMessage = 'Failed to delete notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [deleteNotification]);

  // Search notifications
  const searchNotifications = useCallback(async (searchTerm, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...params
      });

      const response = await axios.get(
        `/api/notifications/search?${queryParams.toString()}`,
        getAuthConfig()
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Export notifications
  const exportNotifications = useCallback(async (format = 'json') => {
    try {
      const response = await axios.get(
        `/api/notifications/export?format=${format}`,
        {
          ...getAuthConfig(),
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notifications.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Basic operations
    fetchNotifications,
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationStats,
    
    // Custom operations
    sendCustomNotification,
    
    // Technician-specific
    getTechnicianNotifications,
    notifyTechnicians,
    
    // Utility functions
    clearError,
    refreshNotifications,
    getUnreadCount,
    
    // Bulk operations
    bulkMarkAsRead,
    bulkDelete,
    
    // Search and export
    searchNotifications,
    exportNotifications
  };
};

export default useNotifications;
