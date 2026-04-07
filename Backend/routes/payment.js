import express from 'express';
import {
  createOrder,
  verifyPayment,
  getPayment,
  getUserPayments,
  getTechnicianEarnings,
  refundPayment,
  handleWebhook
} from '../controllers/paymentController.js';
import { validatePayment } from '../middleware/validation.js';
import { authenticate, authenticateUser, authenticateTechnician, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/:paymentId', authenticate, getPayment);

// User routes
router.get('/user/history', authenticateUser, getUserPayments);

// Technician routes
router.get('/technician/earnings', authenticateTechnician, getTechnicianEarnings);

// Admin routes
router.post('/:paymentId/refund', authenticate, authorize('admin'), refundPayment);

export default router;
