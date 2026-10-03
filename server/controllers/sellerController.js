import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as sellerRepo from '../repositories/sellerRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';
import { clean, isEmail, isIndianMobile, isPinCode } from '../utils/validation.js';

const publicUser = user => ({ id: Number(user.id), name: user.name, email: user.email, phone: user.phone, role: user.role });
const sign = user => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret-change-me', { expiresIn: '7d' });

export const registerSeller = asyncHandler(async (req, res) => {
  const { name, email, phone, password, storeName, address, city, district, state, pinCode, businessDescription } = req.body;
  if (!name || !storeName || !isEmail(email) || !password || password.length < 8) return fail(res, 'Name, store name, valid email and an 8+ character password are required');
  if (phone && !isIndianMobile(phone)) return fail(res, 'Invalid mobile number');
  if (pinCode && !isPinCode(pinCode)) return fail(res, 'Invalid PIN code');
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await sellerRepo.registerSeller({ name: clean(name), email: String(email).trim().toLowerCase(), phone: clean(phone), passwordHash, storeName: clean(storeName), address: clean(address), city: clean(city), district: clean(district), state: clean(state), pinCode: clean(pinCode), businessDescription: clean(businessDescription) });
    return ok(res, { user: publicUser(result.user), profile: result.profile, token: sign(result.user) }, 201);
  } catch (error) {
    if (error.code === '23505') return fail(res, 'Email is already registered', 409);
    throw error;
  }
});

export const getSellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellerRepo.getProfile(req.user.id);
  if (!profile) return fail(res, 'Seller profile not found', 404);
  return ok(res, profile);
});

export const updateSellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellerRepo.updateProfile(req.user.id, req.body);
  if (!profile) return fail(res, 'Seller profile not found', 404);
  return ok(res, profile);
});

export const getDashboard = asyncHandler(async (req, res) => ok(res, await sellerRepo.dashboard(req.user.id)));
export const getProducts = asyncHandler(async (req, res) => ok(res, await sellerRepo.listProducts(req.user.id)));
export const createProduct = asyncHandler(async (req, res) => {
  const required = ['name', 'description', 'categoryId', 'originalPrice', 'salePrice'];
  if (required.some(key => req.body[key] === undefined || req.body[key] === '')) return fail(res, 'Product name, description, category, original price and sale price are required');
  const product = await sellerRepo.createProduct(req.user.id, req.body);
  return ok(res, product, 201);
});
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await sellerRepo.updateProduct(req.user.id, Number(req.params.id), req.body);
  if (!product) return fail(res, 'Product not found or not owned by this seller', 404);
  return ok(res, product);
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const removed = await sellerRepo.removeProduct(req.user.id, Number(req.params.id));
  if (!removed) return fail(res, 'Product not found or not owned by this seller', 404);
  return ok(res, { message: 'Product deleted' });
});
export const getOrders = asyncHandler(async (req, res) => ok(res, await sellerRepo.listOrders(req.user.id)));
export const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const result = await sellerRepo.updateOrderItemStatus(req.user.id, Number(req.params.orderItemId), clean(req.body.status));
  if (!result) return fail(res, 'Order item not found or not owned by this seller', 404);
  return ok(res, result);
});

export const listSellers = asyncHandler(async (req, res) => ok(res, await sellerRepo.listAllSellers()));
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const profile = await sellerRepo.updateSellerStatus(Number(req.params.userId), clean(req.body.status));
  if (!profile) return fail(res, 'Seller not found', 404);
  return ok(res, profile);
});
