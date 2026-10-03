import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import { pool } from './config/database.js';

const isProd = process.env.NODE_ENV === 'production';

/*
 * Fail fast instead of silently running with an insecure default secret.
 */
if (
  isProd &&
  (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'replace-with-a-long-random-secret'
  )
) {
  throw new Error(
    'JWT_SECRET must be set to a strong random value in production. See server/.env.example'
  );
}

const app = express();

app.disable('x-powered-by');

app.set('trust proxy', 1);

/*
 * Security middleware
 */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

app.use(compression());

app.use(morgan(isProd ? 'combined' : 'dev'));

/*
 * CORS
 */
const allowedOrigins = (
  process.env.CLIENT_URL ||
  'http://127.0.0.1:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

/*
 * Request parsing
 */
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

/*
 * IMPORTANT:
 *
 * Do NOT put a global rate limiter on /api.
 *
 * The Orders page and Track Order page can periodically refresh
 * order information. A global /api limiter can cause legitimate
 * requests to /api/orders to return HTTP 429.
 *
 * Rate limiting should instead be applied to sensitive routes
 * such as authentication and newsletter endpoints.
 */

/*
 * Health check
 */
app.get('/api/health', async (req, res) => {
  let database = 'not configured';

  if (pool) {
    try {
      await pool.query('SELECT 1');
      database = 'connected';
    } catch {
      database = 'unreachable';
    }
  }

  res.json({
    success: true,
    data: {
      status: 'ok',
      brand: 'DREAM KRAFT LUNGIS',
      database
    }
  });
});

/*
 * API Routes
 */
app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/wishlist', wishlistRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/coupons', couponRoutes);

app.use('/api/newsletter', newsletterRoutes);

app.use('/api/sellers', sellerRoutes);

/*
 * 404 handler
 */
app.use(notFound);

/*
 * Centralized error handler
 */
app.use(errorHandler);

export default app;