import { cartItems } from '../data.js';
import { num, query, usingDatabase } from './db.js';

export async function listRaw(userId) {
  if (!usingDatabase()) return cartItems.filter(item => item.userId === userId);
  const { rows } = await query('SELECT product_id, variant_id, quantity FROM cart_items WHERE user_id = $1', [userId]);
  return rows.map(row => ({ productId: num(row.product_id), variantId: num(row.variant_id), quantity: row.quantity }));
}

export async function upsert(userId, productId, variantId, quantity) {
  if (!usingDatabase()) {
    const existing = cartItems.find(item => item.userId === userId && item.productId === productId && item.variantId === variantId);
    if (existing) existing.quantity += quantity;
    else cartItems.push({ id: cartItems.length + 1, userId, productId, variantId, quantity, createdAt: new Date().toISOString() });
    return;
  }
  await query(
    `INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, product_id, variant_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [userId, productId, variantId || null, quantity]
  );
}

export async function setQuantity(userId, productId, quantity) {
  if (!usingDatabase()) {
    const item = cartItems.find(row => row.userId === userId && row.productId === productId);
    if (item) item.quantity = quantity;
    return Boolean(item);
  }
  const { rowCount } = await query('UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3', [quantity, userId, productId]);
  return rowCount > 0;
}

export async function remove(userId, productId) {
  if (!usingDatabase()) {
    const index = cartItems.findIndex(row => row.userId === userId && row.productId === productId);
    if (index !== -1) cartItems.splice(index, 1);
    return;
  }
  await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
}

export async function clear(userId) {
  if (!usingDatabase()) {
    for (let index = cartItems.length - 1; index >= 0; index -= 1) if (cartItems[index].userId === userId) cartItems.splice(index, 1);
    return;
  }
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
}
