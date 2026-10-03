import jwt from 'jsonwebtoken';

import * as userRepo
  from '../repositories/userRepo.js';

import * as sellerRepo
  from '../repositories/sellerRepo.js';

import { asyncHandler }
  from '../utils/asyncHandler.js';

import { fail }
  from '../utils/respond.js';


// =========================
// OPTIONAL AUTH
// =========================

export const optionalAuth =
  asyncHandler(async (req, res, next) => {

    const header =
      req.headers.authorization || '';

    const token =
      header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    if (!token) {
      return next();
    }

    try {

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET ||
        'dev-secret-change-me'
      );

      req.user =
        await userRepo.findById(payload.id);

    } catch {

      req.user = null;

    }

    next();
  });


// =========================
// REQUIRE LOGIN
// =========================

export const requireAuth =
  asyncHandler(async (req, res, next) => {

    optionalAuth(req, res, () => {

      if (!req.user) {
        return fail(
          res,
          'Authentication required',
          401
        );
      }

      next();

    });
  });


// =========================
// ADMIN
// =========================

export function requireAdmin(
  req,
  res,
  next
) {

  if (
    !req.user ||
    req.user.role !== 'admin'
  ) {
    return fail(
      res,
      'Admin access required',
      403
    );
  }

  next();
}


// =========================
// SELLER
// =========================

export const requireSeller =
  asyncHandler(async (req, res, next) => {

    if (
      !req.user ||
      req.user.role !== 'seller'
    ) {
      return fail(
        res,
        'Seller access required',
        403
      );
    }

    const profile =
      await sellerRepo.getProfile(
        req.user.id
      );

    if (!profile) {
      return fail(
        res,
        'Seller profile not found',
        403
      );
    }

    if (profile.status !== 'approved') {

      return fail(
        res,
        `Seller account is ${profile.status}. Admin approval is required.`,
        403
      );

    }

    req.sellerProfile = profile;

    next();
  });