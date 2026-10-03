import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { num, query, usingDatabase } from './db.js';

function requireDatabase() {
  if (!usingDatabase() || !pool) {
    throw new Error('PostgreSQL is required for seller features. Check server/.env DATABASE_URL.');
  }
}

const mapProfile = row => row && ({
  id: num(row.id),
  userId: num(row.user_id),
  storeName: row.store_name,
  phone: row.phone,
  email: row.email,
  address: row.address,
  city: row.city,
  district: row.district,
  state: row.state,
  pinCode: row.pin_code,
  businessDescription: row.business_description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapProduct = row => row && ({
  id: num(row.id),
  categoryId: num(row.category_id),
  categoryName: row.category_name,
  name: row.name,
  slug: row.slug,
  description: row.description,
  fabric: row.fabric,
  originalPrice: Number(row.original_price),
  salePrice: Number(row.sale_price),
  discountPercentage: Number(row.discount_percentage),
  stockQuantity: Number(row.stock_quantity),
  rating: Number(row.rating),
  reviewCount: Number(row.review_count),
  isFeatured: row.is_featured,
  isNewArrival: row.is_new_arrival,
  isBestSeller: row.is_best_seller,
  sellerId: num(row.seller_id),
  createdAt: row.created_at
});

export async function registerSeller({ name, email, phone, passwordHash, storeName, address, city, district, state, pinCode, businessDescription }) {
  requireDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'seller')
       RETURNING id, name, email, phone, role, created_at`,
      [name, email.toLowerCase(), phone || null, passwordHash]
    );
    const user = userResult.rows[0];
    const profileResult = await client.query(
      `INSERT INTO seller_profiles
       (user_id, store_name, phone, email, address, city, district, state, pin_code, business_description, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
       RETURNING *`,
      [user.id, storeName, phone || null, email.toLowerCase(), address || null, city || null, district || null, state || null, pinCode || null, businessDescription || null]
    );
    await client.query('COMMIT');
    return { user, profile: mapProfile(profileResult.rows[0]) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getProfile(userId) {
  requireDatabase();
  const { rows } = await query('SELECT * FROM seller_profiles WHERE user_id = $1', [userId]);
  return mapProfile(rows[0]) || null;
}

export async function updateProfile(userId, payload) {
  requireDatabase();
  const { rows } = await query(
    `UPDATE seller_profiles SET
      store_name = COALESCE($1, store_name), phone = COALESCE($2, phone),
      address = COALESCE($3, address), city = COALESCE($4, city),
      district = COALESCE($5, district), state = COALESCE($6, state),
      pin_code = COALESCE($7, pin_code), business_description = COALESCE($8, business_description),
      updated_at = NOW()
     WHERE user_id = $9 RETURNING *`,
    [payload.storeName, payload.phone, payload.address, payload.city, payload.district, payload.state, payload.pinCode, payload.businessDescription, userId]
  );
  return mapProfile(rows[0]) || null;
}

export async function dashboard(userId) {
  requireDatabase();
  const { rows } = await query(
    `SELECT
      (SELECT COUNT(*)::int FROM products WHERE seller_id = $1) AS products,
      (SELECT COUNT(DISTINCT order_id)::int FROM order_items WHERE seller_id = $1) AS orders,
      (SELECT COALESCE(SUM(total_price), 0)::numeric FROM order_items WHERE seller_id = $1) AS sales,
      (SELECT COUNT(*)::int FROM order_items WHERE seller_id = $1 AND seller_status IN ('confirmed','processing')) AS pending_items`,
    [userId]
  );
  const row = rows[0];
  return { products: Number(row.products), orders: Number(row.orders), sales: Number(row.sales), pendingItems: Number(row.pending_items) };
}

export async function listProducts(userId) {
  requireDatabase();
  const { rows } = await query(
    `SELECT p.*, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.seller_id = $1 ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows.map(mapProduct);
}

export async function createProduct(userId, payload) {
  requireDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

const baseSlug = String(
  payload.slug || payload.name || ''
)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

let slug = baseSlug;

const existingSlug = await client.query(
  'SELECT id FROM products WHERE slug = $1 LIMIT 1',
  [slug]
);

if (existingSlug.rows.length > 0) {
  slug = `${baseSlug}-${Date.now()}`;
}

const result = await client.query(
  `INSERT INTO products
   (seller_id, category_id, name, slug, description, fabric,
    original_price, sale_price, discount_percentage, stock_quantity,
    is_featured, is_new_arrival, is_best_seller)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
   RETURNING *`,
  [
    userId,
    payload.categoryId,
    payload.name,
    slug,
    payload.description,
    payload.fabric || null,
    payload.originalPrice,
    payload.salePrice,
    payload.discountPercentage || 0,
    payload.stockQuantity || 0,
    Boolean(payload.isFeatured),
    Boolean(payload.isNewArrival),
    Boolean(payload.isBestSeller)
  ]
);
    const product = result.rows[0];

    if (Array.isArray(payload.images)) {
      for (let index = 0; index < payload.images.length; index += 1) {
        const image = payload.images[index];
        if (!image?.imageUrl) continue;
        await client.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES ($1,$2,$3,$4)`,
          [product.id, image.imageUrl, image.altText || payload.name, index + 1]
        );
      }
    }

    if (Array.isArray(payload.variants)) {
      for (const variant of payload.variants) {
        if (!variant?.colour || !variant?.sizeOrLength || !variant?.sku) continue;
        await client.query(
          `INSERT INTO product_variants (product_id, colour, size_or_length, stock_quantity, sku) VALUES ($1,$2,$3,$4,$5)`,
          [product.id, variant.colour, variant.sizeOrLength, variant.stockQuantity || 0, variant.sku]
        );
      }
    }
    await client.query('COMMIT');
    return getProductBySeller(userId, product.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getProductBySeller(userId, productId) {
  requireDatabase();
  const { rows } = await query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1 AND p.seller_id = $2`,
    [productId, userId]
  );
  return mapProduct(rows[0]) || null;
}

export async function updateProduct(userId, productId, payload) {
  requireDatabase();
  const fields = {
    name: payload.name,
    description: payload.description,
    fabric: payload.fabric,
    original_price: payload.originalPrice,
    sale_price: payload.salePrice,
    discount_percentage: payload.discountPercentage,
    stock_quantity: payload.stockQuantity,
    is_featured: payload.isFeatured,
    is_new_arrival: payload.isNewArrival,
    is_best_seller: payload.isBestSeller
  };
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!entries.length) return getProductBySeller(userId, productId);
  const setSql = entries.map(([key], index) => `${key} = $${index + 3}`).join(', ');
  const { rows } = await query(
    `UPDATE products SET ${setSql}, updated_at = NOW() WHERE id = $1 AND seller_id = $2 RETURNING id`,
    [productId, userId, ...entries.map(([, value]) => value)]
  );
  if (!rows.length) return null;
  return getProductBySeller(userId, productId);
}

export async function removeProduct(userId, productId) {
  requireDatabase();
  const { rowCount } = await query('DELETE FROM products WHERE id = $1 AND seller_id = $2', [productId, userId]);
  return rowCount > 0;
}

export async function listOrders(userId) {
  requireDatabase();
  const { rows } = await query(
    `SELECT oi.id AS order_item_id, oi.order_id, oi.product_id, oi.product_name,
            oi.colour, oi.size_or_length, oi.quantity, oi.unit_price, oi.total_price,
            oi.seller_status, o.order_number, o.customer_name, o.city, o.state,
            o.payment_method, o.payment_status, o.order_status, o.created_at
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.seller_id = $1
     ORDER BY o.created_at DESC, oi.id DESC`,
    [userId]
  );
  return rows.map(row => ({
    orderItemId: num(row.order_item_id), orderId: num(row.order_id), productId: num(row.product_id),
    productName: row.product_name, colour: row.colour, sizeOrLength: row.size_or_length,
    quantity: Number(row.quantity), unitPrice: Number(row.unit_price), totalPrice: Number(row.total_price),
    sellerStatus: row.seller_status, orderNumber: row.order_number, customerName: row.customer_name,
    city: row.city, state: row.state, paymentMethod: row.payment_method,
    paymentStatus: row.payment_status, orderStatus: row.order_status, createdAt: row.created_at
  }));
}

export async function updateOrderItemStatus(userId, orderItemId, status) {
  requireDatabase();

  const allowed = [
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  if (!allowed.includes(status)) {
    throw Object.assign(
      new Error('Invalid seller order status'),
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update seller's order-item status
    const { rows } = await client.query(
      `UPDATE order_items
       SET seller_status = $1
       WHERE id = $2
         AND seller_id = $3
       RETURNING id, order_id, seller_status`,
      [status, orderItemId, userId]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      return null;
    }

    const orderId = rows[0].order_id;

    /*
     * Update the customer-facing order status.
     *
     * Seller:
     * confirmed  -> Customer: Confirmed
     * processing -> Customer: Packed
     * shipped    -> Customer: Shipped
     * delivered  -> Customer: Delivered
     */

    const itemResult = await client.query(
      `SELECT seller_status
       FROM order_items
       WHERE order_id = $1`,
      [orderId]
    );

    const statuses = itemResult.rows.map(
      row => row.seller_status
    );

    let customerStatus = 'confirmed';

    if (
      statuses.length > 0 &&
      statuses.every(
        itemStatus => itemStatus === 'cancelled'
      )
    ) {
      customerStatus = 'cancelled';
    } else if (
      statuses.length > 0 &&
      statuses.every(
        itemStatus => itemStatus === 'delivered'
      )
    ) {
      customerStatus = 'delivered';
    } else if (
      statuses.some(
        itemStatus => itemStatus === 'confirmed'
      )
    ) {
      customerStatus = 'confirmed';
    } else if (
      statuses.some(
        itemStatus => itemStatus === 'processing'
      )
    ) {
      customerStatus = 'packed';
    } else if (
      statuses.some(
        itemStatus => itemStatus === 'shipped'
      )
    ) {
      customerStatus = 'shipped';
    }

    await client.query(
      `UPDATE orders
       SET order_status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [customerStatus, orderId]
    );

    await client.query('COMMIT');

    return {
      orderItemId: num(rows[0].id),
      orderId: num(orderId),
      sellerStatus: rows[0].seller_status,
      orderStatus: customerStatus
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
export async function listAllSellers() {
  requireDatabase();
  const { rows } = await query(
    `SELECT u.id AS user_id, u.name, u.email, u.phone, sp.store_name, sp.status, sp.city, sp.state, sp.created_at
     FROM users u JOIN seller_profiles sp ON sp.user_id = u.id
     WHERE u.role = 'seller' ORDER BY sp.created_at DESC`
  );
  return rows.map(row => ({ id: num(row.user_id), name: row.name, email: row.email, phone: row.phone, storeName: row.store_name, status: row.status, city: row.city, state: row.state, createdAt: row.created_at }));
}

export async function updateSellerStatus(userId, status) {
  requireDatabase();
  const allowed = ['pending', 'approved', 'rejected', 'suspended'];
  if (!allowed.includes(status)) throw Object.assign(new Error('Invalid seller status'), { status: 400 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('UPDATE seller_profiles SET status = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *', [status, userId]);
    if (!rows.length) { await client.query('ROLLBACK'); return null; }
    if (status === 'suspended' || status === 'rejected') await client.query(`UPDATE users SET role = 'seller', updated_at = NOW() WHERE id = $1`, [userId]);
    await client.query('COMMIT');
    return mapProfile(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
