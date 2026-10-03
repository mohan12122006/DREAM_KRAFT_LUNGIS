import * as productRepo from '../repositories/productRepo.js';
import * as wishlistRepo from '../repositories/wishlistRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';

async function serialize(userId) {
  const productIds = await wishlistRepo.listProductIds(userId);
  const products = await Promise.all(productIds.map(id => productRepo.getBySlugOrId(id)));
  return products.filter(Boolean);
}

export const getWishlist = asyncHandler(async (req, res) => ok(res, await serialize(req.user.id)));

export const addWishlist = asyncHandler(async (req, res) => {
  await wishlistRepo.add(req.user.id, Number(req.params.productId));
  return ok(res, await serialize(req.user.id), 201);
});

export const removeWishlist = asyncHandler(async (req, res) => {
  await wishlistRepo.remove(req.user.id, Number(req.params.productId));
  return ok(res, await serialize(req.user.id));
});
