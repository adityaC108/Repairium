import express from 'express';
import {
  getAllReviews,
  getReviewById,
  getUserReviews,
  getTechnicianReviews,
  createReview,
  updateReview,
  deleteReview,
  updateReviewStatus,
  getReviewStatistics,
  respondToReview
} from '../controllers/reviewController.js';
import { authenticateUser, authenticateTechnician, authenticateAdmin } from '../middleware/auth.js';
import { validateReview, validateReviewResponse } from '../middleware/validation.js';

const router = express.Router();

// Public Routes (No authentication required)
router.get('/statistics', getReviewStatistics);

// User Routes (User authentication required)
router.use('/user', authenticateUser);
router.get('/user/reviews', getUserReviews);
router.post('/user/reviews', validateReview, createReview);
router.put('/user/reviews/:reviewId', updateReview);
router.delete('/user/reviews/:reviewId', deleteReview);

// Technician Routes (Technician authentication required)
router.use('/technician', authenticateTechnician);
router.get('/technician/reviews', getTechnicianReviews);
router.post('/technician/reviews/:reviewId/respond', validateReviewResponse, respondToReview);

// Admin Routes (Admin authentication required)
router.use('/admin', authenticateAdmin);
router.get('/admin/reviews', getAllReviews);
router.get('/admin/reviews/:reviewId', getReviewById);
router.put('/admin/reviews/:reviewId/status', updateReviewStatus);
router.post('/admin/reviews/:reviewId/respond', validateReviewResponse, respondToReview);

export default router;
