import * as cartRepo from '../repositories/cartRepo.js';
import * as productRepo from '../repositories/productRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';

async function serialize(userId) {
  const raw = await cartRepo.listRaw(userId);
  const items = await Promise.all(raw.map(async item => ({
    product: await productRepo.getBySlugOrId(item.productId),
    variantId: item.variantId,
    quantity: item.quantity
  })));
  return { items };
}

export const getCart = asyncHandler(async (req, res) => ok(res, await serialize(req.user.id)));

export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const product = await productRepo.getBySlugOrId(Number(productId));
  if (!product) return fail(res, 'Product not found', 404);
  if (product.stockQuantity < quantity) return fail(res, 'Requested quantity is not available', 409);
  await cartRepo.upsert(req.user.id, product.id, variantId, Number(quantity));
  return ok(res, await serialize(req.user.id), 201);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const updated = await cartRepo.setQuantity(req.user.id, Number(req.params.productId), Math.max(1, Number(req.body.quantity || 1)));
  if (!updated) return fail(res, 'Cart item not found', 404);
  return ok(res, await serialize(req.user.id));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  await cartRepo.remove(req.user.id, Number(req.params.productId));
  return ok(res, await serialize(req.user.id));
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartRepo.clear(req.user.id);
  return ok(res, await serialize(req.user.id));
});
