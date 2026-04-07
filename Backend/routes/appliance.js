import express from 'express';
import multer from 'multer';
import {
    getAllAppliances,
    getApplianceById,
    createAppliance,
    updateAppliance,
    deleteAppliance,
    getApplianceCategories,
    getApplianceBrands,
    getApplianceModels,
    getFeaturedAppliances,
    getPopularAppliances,
    searchAppliances,
    updateApplianceStatus,
    updateApplianceFeatured,
    getApplianceStatistics
} from '../controllers/applianceController.js';
import { validateAppliance, validateApplianceStatus } from '../middleware/validation.js';
import { authenticateAdmin } from '../middleware/auth.js';

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

// Public routes
router.get('/', getAllAppliances);
router.get('/categories', getApplianceCategories);
router.get('/brands', getApplianceBrands);
router.get('/models', getApplianceModels);
router.get('/featured', getFeaturedAppliances);
router.get('/popular', getPopularAppliances);
router.get('/search', searchAppliances);
router.get('/:applianceId', getApplianceById);

// Admin routes
router.post('/', authenticateAdmin, upload.single('image'), validateAppliance, createAppliance);
router.put('/:applianceId', authenticateAdmin, upload.single('image'), validateAppliance, updateAppliance);
router.delete('/:applianceId', authenticateAdmin, deleteAppliance);
router.put('/:applianceId/status', authenticateAdmin, validateApplianceStatus, updateApplianceStatus);
router.put('/:applianceId/featured', authenticateAdmin, updateApplianceFeatured);
router.get('/statistics/overview', authenticateAdmin, getApplianceStatistics);

export default router;
