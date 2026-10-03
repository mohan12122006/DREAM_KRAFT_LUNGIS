import rateLimit from 'express-rate-limit';
import { Router } from 'express';

import {
  login,
  logout,
  me,
  register,
  changePassword
} from '../controllers/authController.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication Rate Limiter
|--------------------------------------------------------------------------
*/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false
});

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

router.post(
  '/register',
  authLimiter,
  register
);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

router.post(
  '/login',
  authLimiter,
  login
);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

router.post(
  '/logout',
  requireAuth,
  logout
);

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

router.get(
  '/me',
  requireAuth,
  me
);

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
|
| User must be logged in.
|
*/

router.post(
  '/change-password',
  requireAuth,
  changePassword
);

export default router;