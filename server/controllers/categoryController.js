import * as categoryRepo from '../repositories/categoryRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';

export const listCategories = asyncHandler(async (req, res) => {
  return ok(res, await categoryRepo.list());
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryRepo.getBySlug(req.params.slug);
  if (!category) return fail(res, 'Category not found', 404);
  return ok(res, category);
});
