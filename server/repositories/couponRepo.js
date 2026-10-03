import { coupons } from '../data.js';
import { num, query, usingDatabase } from './db.js';

const mapRow = row => row && ({
  id: num(row.id),
  code: row.code,
  description: row.description,
  discountType: row.discount_type,
  discountValue: Number(row.discount_value),
  minimumOrderValue: Number(row.minimum_order_value),
  maximumDiscount: row.maximum_discount === null ? null : Number(row.maximum_discount),
  isActive: row.is_active
});

export async function findActiveByCode(code) {
  const normalized = String(code || '').toUpperCase();
  if (!usingDatabase()) return coupons.find(item => item.code === normalized && item.isActive) || null;
  const { rows } = await query(
    `SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE
       AND (start_date IS NULL OR start_date <= CURRENT_DATE)
       AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       AND (usage_limit IS NULL OR used_count < usage_limit)`,
    [normalized]
  );
  return mapRow(rows[0]) || null;
}

export async function incrementUsage(code, client) {
  if (!usingDatabase()) return;
  const runner = client || { query };
  await runner.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = $1', [String(code).toUpperCase()]);
}
