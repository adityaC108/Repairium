import express from 'express';
import multer from 'multer';
import {
  login,
  registerUser,
  registerAdmin,
  registerTechnician,
  logout,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  resetPasswordRequest,
  resetPassword,
  uploadAvatar,
  verifyEmail,
  updateProfile
} from '../controllers/authController.js';
import {
  validateUserRegistration,
  validateAdminRegistration,
  validateTechnicianRegistration,
  validateLogin
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Universal login for all roles
router.post('/login', validateLogin, login);

// Registration routes (separate for each role)
router.post('/register/user', validateUserRegistration, registerUser);
router.post('/register/admin', validateAdminRegistration, registerAdmin);
router.post('/register/technician', validateTechnicianRegistration, registerTechnician);

// Common authentication routes
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

// Protected routes (require authentication)
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, changePassword);
router.put('/profile', authenticate, updateProfile);

// Password reset routes
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password', resetPassword);

// Email verification
// router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail); // Add GET route for query parameters

// Avatar upload
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
