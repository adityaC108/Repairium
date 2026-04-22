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
  verifyTechnicianDocument
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { 
  validateProfileUpdate, 
  validateUserManagement,
  validateTechnicianManagement 
} from '../middleware/validation.js';

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Profile Management Routes
router.get('/profile', getAdminProfile);
router.put('/profile', validateProfileUpdate, updateAdminProfile);

// Dashboard Routes
router.get('/dashboard', getDashboardStatistics);

// User Management Routes
router.get('/users', getAllUsers);
router.put('/users/:userId/status', validateUserManagement, manageUserStatus);

// Technician Management Routes
router.get('/technicians', getAllTechnicians);
router.put('/technicians/:technicianId/status', validateTechnicianManagement, manageTechnicianStatus);
router.put('/technicians/:technicianId/verify', validateTechnicianManagement, verifyTechnician);
router.put('/technicians/:technicianId/documents/:documentType', verifyTechnicianDocument);

// Booking Management Routes
router.get('/bookings', getAllBookings);

// Reports Routes
router.get('/reports', getReports);

export default router;
