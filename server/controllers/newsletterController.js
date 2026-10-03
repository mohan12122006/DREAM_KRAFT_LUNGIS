import rateLimit from 'express-rate-limit';
import * as newsletterRepo from '../repositories/newsletterRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';
import { isEmail } from '../utils/validation.js';

export const newsletterLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

export const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!isEmail(email)) return fail(res, 'Enter a valid email address');
  if (await newsletterRepo.isSubscribed(email)) return fail(res, 'This email is already subscribed', 409);
  await newsletterRepo.subscribe(email);
  return ok(res, { email, message: 'Subscription successful' }, 201);
});
