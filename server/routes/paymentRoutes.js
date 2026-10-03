import { Router } from 'express';

import {
  config,
  createOrder,
  verify
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/config', config);
router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, verify);

export default router;
