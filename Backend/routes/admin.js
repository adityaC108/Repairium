import express from 'express';
import {
  getAdminProfile,
  updateAdminProfile,
  getDashboardStatistics,
  getAllUsers,
  getAllTechnicians,
  getAllBookings,
  verifyTechnician,
  manageUserStatus,
  manageTechnicianStatus,
  getReports,
  verifyTechnicianDocument,
  getUserById,
  getTechnicianById,
  updateAdminAvatar
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { 
  validateProfileUpdate, 
  validateUserManagement,
  validateTechnicianManagement,
} from '../middleware/validation.js';
import multer from 'multer';

const router = express.Router();
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
// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Profile Management Routes
router.get('/profile', getAdminProfile);
router.put('/profile', validateProfileUpdate, updateAdminProfile);
router.put('/profile/avatar', upload.single('avatar'), updateAdminAvatar);

// Dashboard Routes
router.get('/dashboard', getDashboardStatistics);

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/status', validateUserManagement, manageUserStatus);

// Technician Management Routes
router.get('/technicians', getAllTechnicians);
router.get('/technicians/:technicianId', getTechnicianById);
router.put('/technicians/:technicianId/status', validateTechnicianManagement, manageTechnicianStatus);
router.put('/technicians/:technicianId/verify', validateTechnicianManagement, verifyTechnician);
router.put('/technicians/:technicianId/documents/:documentType', verifyTechnicianDocument);

// Booking Management Routes
router.get('/bookings', getAllBookings);

// Reports Routes
router.get('/reports', getReports);

export default router;
