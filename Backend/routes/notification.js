import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All notification routes will be protected
router.use(authenticate);

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification routes - to be implemented'
  });
});

export default router;
