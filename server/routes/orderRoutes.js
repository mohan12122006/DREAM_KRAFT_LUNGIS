import { Router } from 'express';

import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  cancelOrderItem
} from '../controllers/orderController.js';

import {
  optionalAuth,
  requireAdmin,
  requireAuth
} from '../middleware/auth.js';

const router = Router();

// Create order
router.post('/', optionalAuth, createOrder);

// Customer orders
router.get('/', requireAuth, listOrders);

// Single order
router.get('/:id', optionalAuth, getOrder);

// Admin update order status
router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  updateOrderStatus
);

// Customer cancel individual ordered product
router.put(
  '/items/:orderItemId/cancel',
  requireAuth,
  cancelOrderItem
);

export default router;