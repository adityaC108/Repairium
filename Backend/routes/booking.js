import express from 'express';
import {
  createBooking,
  acceptBooking,
  cancelBooking,
  getAvailableBookings,
  getBookingDetails
} from '../controllers/bookingController.js';
import { authenticateUser, authenticateTechnician, authenticateAdmin } from '../middleware/auth.js';
import { validateBooking, validateBookingCancellation } from '../middleware/validation.js';

const router = express.Router();

// User Routes (User authentication required)
router.post('/user/bookings', authenticateUser, validateBooking, createBooking);
router.delete('/user/bookings/:bookingId', authenticateUser, validateBookingCancellation, cancelBooking);
router.get('/user/bookings/:bookingId', authenticateUser, getBookingDetails);

// Technician Routes (Technician authentication required)
router.get('/technician/available-bookings', authenticateTechnician, getAvailableBookings);
router.post('/technician/bookings/:bookingId/accept', authenticateTechnician, acceptBooking);
router.get('/technician/bookings/:bookingId', authenticateTechnician, getBookingDetails);

// Admin Routes (Admin authentication required)
router.delete('/admin/bookings/:bookingId', authenticateAdmin, validateBookingCancellation, cancelBooking);
router.get('/admin/bookings/:bookingId', authenticateAdmin, getBookingDetails);

export default router;
