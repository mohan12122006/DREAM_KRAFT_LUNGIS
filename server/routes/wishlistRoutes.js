import { Router } from 'express';
import { addWishlist, getWishlist, removeWishlist } from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', getWishlist);
router.post('/:productId', addWishlist);
router.delete('/:productId', removeWishlist);
export default router;
