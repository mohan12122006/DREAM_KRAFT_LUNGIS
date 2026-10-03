import * as productRepo from '../repositories/productRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';
import { clean } from '../utils/validation.js';

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(24, Math.max(1, Number(req.query.limit || 12)));
  const { items, total } = await productRepo.list(req.query, page, limit);
  return ok(res, { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productRepo.getBySlugOrId(req.params.id);
  if (!product) return fail(res, 'Product not found', 404);
  const related = await productRepo.listRelated(product.categoryId, product.id, 4);
  return ok(res, { ...product, related });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, slug, description, categoryId, originalPrice, salePrice } = req.body;
  if (!clean(name) || !clean(slug) || !clean(description) || !categoryId || !originalPrice || !salePrice) {
    return fail(res, 'name, slug, description, categoryId, originalPrice and salePrice are required');
  }
  const product = await productRepo.create(req.body);
  return ok(res, product, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productRepo.update(Number(req.params.id), req.body);
  if (!product) return fail(res, 'Product not found', 404);
  return ok(res, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const removed = await productRepo.remove(Number(req.params.id));
  if (!removed) return fail(res, 'Product not found', 404);
  return ok(res, { message: 'Product deleted' });
});

export const listReviews = asyncHandler(async (req, res) => ok(res, await productRepo.listReviews(Number(req.params.productId))));
