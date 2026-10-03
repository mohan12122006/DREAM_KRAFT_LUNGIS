import * as couponRepo from '../repositories/couponRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponRepo.findActiveByCode(req.body.code);
  if (!coupon) return fail(res, 'Coupon code is not valid', 404);
  return ok(res, coupon);
});
