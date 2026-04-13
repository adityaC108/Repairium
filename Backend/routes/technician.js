import express from 'express';
import multer from 'multer';
import {
  getTechnicianProfile,
  updateTechnicianProfile,
  updateAvatar,
  getTechnicianBookings,
  updateBookingStatus,
  getTechnicianReviews,
  updateTechnicianAvailability,
  updateTechnicianLocation,
  uploadTechnicianDocuments,
  updateBankDetails,
  getTechnicianEarnings,
  getTechnicianStatistics,
  respondToServiceRequest
} from '../controllers/technicianController.js';
import { authenticateTechnician } from '../middleware/auth.js';
import { validateProfileUpdate, validateBookingStatus, validateBankDetails, validateLocation, validateOnlineStatus } from '../middleware/validation.js';

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

// Apply technician authentication middleware to all routes
router.use(authenticateTechnician);

// Profile Management Routes
router.get('/profile', getTechnicianProfile);
router.put('/profile', validateProfileUpdate, updateTechnicianProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);

// Booking Management Routes
router.get('/bookings', getTechnicianBookings);
router.put('/bookings/:bookingId/status', validateBookingStatus, updateBookingStatus);
router.post('/bookings/:bookingId/respond', respondToServiceRequest);

// Review Management Routes
router.get('/reviews', getTechnicianReviews);

// Availability Management Routes
router.put('/availability', validateOnlineStatus, updateTechnicianAvailability);

// Location Management Routes
router.put('/location', validateLocation, updateTechnicianLocation);

// Document Management Routes
router.post('/upload-document', upload.single('document'), uploadTechnicianDocuments);

// Bank Details Routes
router.put('/bank-details', validateBankDetails, updateBankDetails);

// Earnings and Statistics Routes
router.get('/earnings', getTechnicianEarnings);
router.get('/statistics', getTechnicianStatistics);

export default router;
