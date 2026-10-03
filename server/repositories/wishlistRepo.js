import { wishlists } from '../data.js';
import { num, query, usingDatabase } from './db.js';

export async function listProductIds(userId) {
  if (!usingDatabase()) return wishlists.filter(row => row.userId === userId).map(row => row.productId);
  const { rows } = await query('SELECT product_id FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map(row => num(row.product_id));
}

export async function add(userId, productId) {
  if (!usingDatabase()) {
    if (!wishlists.some(row => row.userId === userId && row.productId === productId)) {
      wishlists.push({ id: wishlists.length + 1, userId, productId, createdAt: new Date().toISOString() });
    }
    return;
  }
  await query('INSERT INTO wishlists (user_id, product_id) VALUES ($1,$2) ON CONFLICT (user_id, product_id) DO NOTHING', [userId, productId]);
}

export async function remove(userId, productId) {
  if (!usingDatabase()) {
    const index = wishlists.findIndex(row => row.userId === userId && row.productId === productId);
    if (index !== -1) wishlists.splice(index, 1);
    return;
  }
  await query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [userId, productId]);
}
