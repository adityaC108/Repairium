import express from 'express';
import multer from 'multer';
import {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserReviews,
  updateUserPreferences,
  getUserNotifications,
  markNotificationsAsRead,
  deleteUserAccount,
  getUserStatistics,
  getUserServiceHistory,
  reportIssue
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'), false);
    }
  }
});

// Apply authentication middleware to all user routes
router.use(authenticateUser);

// Profile Management Routes
router.get('/profile', getUserProfile);
router.put('/profile', validateProfileUpdate, updateUserProfile);
router.put('/preferences', updateUserPreferences);

// Booking Management Routes
router.get('/bookings', getUserBookings);

// Review Management Routes
router.get('/reviews', getUserReviews);

// Notification Management Routes
router.get('/notifications', getUserNotifications);
router.put('/notifications/read', markNotificationsAsRead);

// Statistics and Analytics Routes
router.get('/statistics', getUserStatistics);

// Service History Routes
router.get('/service-history', getUserServiceHistory);

// Issue Reporting Routes
router.post('/report-issue', reportIssue);

// Account Management Routes
router.delete('/account', deleteUserAccount);

export default router;
