import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, listProducts, listReviews, updateProduct } from '../controllers/productController.js';
import { createReview } from '../controllers/orderController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listProducts);
router.post('/', requireAuth, requireAdmin, createProduct);
router.get('/:id', getProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);
router.get('/:productId/reviews', listReviews);
router.post('/:productId/reviews', requireAuth, createReview);
export default router;
