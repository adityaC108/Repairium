import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  sendCustomNotification,
  getTechnicianNotifications,
  notifyTechnicians
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes will be protected
router.use(authenticate);

// Get notifications for authenticated user
router.get('/', getNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Get single notification
router.get('/:id', getNotification);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Send custom notification (admin/technician)
router.post('/send', sendCustomNotification);

// Get technician-specific notifications
router.get('/technician/my-notifications', getTechnicianNotifications);

// Send notifications to multiple technicians
router.post('/technicians/notify', notifyTechnicians);

export default router;
