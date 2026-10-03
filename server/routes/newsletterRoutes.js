import { Router } from 'express';
import { newsletterLimiter, subscribe } from '../controllers/newsletterController.js';

const router = Router();
router.post('/subscribe', newsletterLimiter, subscribe);
export default router;
