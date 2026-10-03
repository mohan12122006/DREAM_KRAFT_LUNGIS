import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getDashboard,
  getOrders,
  getProducts,
  getSellerProfile,
  listSellers,
  registerSeller,
  updateOrderItemStatus,
  updateProduct,
  updateSellerProfile,
  updateSellerStatus
} from '../controllers/sellerController.js';

import {
  requireAdmin,
  requireAuth,
  requireSeller
} from '../middleware/auth.js';

const router = Router();


// =========================
// SELLER REGISTRATION
// =========================

router.post(
  '/register',
  registerSeller
);


// =========================
// SELLER PROFILE
// =========================

router.get(
  '/me',
  requireAuth,
  requireSeller,
  getSellerProfile
);

router.put(
  '/me',
  requireAuth,
  requireSeller,
  updateSellerProfile
);


// =========================
// SELLER DASHBOARD
// =========================

router.get(
  '/dashboard',
  requireAuth,
  requireSeller,
  getDashboard
);


// =========================
// SELLER PRODUCTS
// =========================

router.get(
  '/products',
  requireAuth,
  requireSeller,
  getProducts
);

router.post(
  '/products',
  requireAuth,
  requireSeller,
  createProduct
);

router.put(
  '/products/:id',
  requireAuth,
  requireSeller,
  updateProduct
);

router.delete(
  '/products/:id',
  requireAuth,
  requireSeller,
  deleteProduct
);


// =========================
// SELLER ORDERS
// =========================

router.get(
  '/orders',
  requireAuth,
  requireSeller,
  getOrders
);

router.put(
  '/orders/items/:orderItemId/status',
  requireAuth,
  requireSeller,
  updateOrderItemStatus
);


// =========================
// ADMIN SELLER MANAGEMENT
// =========================

router.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  listSellers
);

router.put(
  '/admin/:userId/status',
  requireAuth,
  requireAdmin,
  updateSellerStatus
);

export default router;