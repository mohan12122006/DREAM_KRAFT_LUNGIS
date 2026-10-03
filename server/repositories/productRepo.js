import { categories, products, reviews } from '../data.js';
import { num, query, usingDatabase } from './db.js';

const mapRow = row => row && ({
  id: num(row.id),
  categoryId: num(row.category_id),
  categoryName: row.category_name,
  name: row.name,
  slug: row.slug,
  description: row.description,
  fabric: row.fabric,
  originalPrice: Number(row.original_price),
  salePrice: Number(row.sale_price),
  discountPercentage: row.discount_percentage,
  stockQuantity: row.stock_quantity,
  rating: Number(
    row.live_rating ?? row.rating ?? 0
  ),

  reviewCount: Number(
    row.live_review_count ??
    row.review_count ??
    0
  ),
  isFeatured: row.is_featured,
  isNewArrival: row.is_new_arrival,
  isBestSeller: row.is_best_seller,
  sellerId: num(row.seller_id),
  createdAt: row.created_at,
  colours: row.colours || [],
  images: row.images || [],
  variants: row.variants || []
});

const BASE_SELECT = `
  SELECT
    p.*,
    c.name AS category_name,

    /*
     * ALWAYS USE REAL REVIEW DATA
     * FROM THE reviews TABLE.
     */
    COALESCE(
      (
        SELECT ROUND(AVG(r.rating)::numeric, 1)
        FROM reviews r
        WHERE r.product_id = p.id
      ),
      0
    ) AS live_rating,

    (
      SELECT COUNT(*)
      FROM reviews r
      WHERE r.product_id = p.id
    ) AS live_review_count,

    COALESCE(
      (
        SELECT array_agg(
          DISTINCT v.colour
          ORDER BY v.colour
        )
        FROM product_variants v
        WHERE v.product_id = p.id
      ),
      '{}'
    ) AS colours,
    COALESCE((SELECT json_agg(json_build_object('imageUrl', i.image_url, 'altText', i.alt_text, 'sortOrder', i.sort_order) ORDER BY i.sort_order) FROM product_images i WHERE i.product_id = p.id), '[]') AS images,
    COALESCE((SELECT json_agg(json_build_object('id', v.id, 'productId', v.product_id, 'colour', v.colour, 'sizeOrLength', v.size_or_length, 'stockQuantity', v.stock_quantity, 'sku', v.sku) ORDER BY v.id) FROM product_variants v WHERE v.product_id = p.id), '[]') AS variants
  FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

function filterProductsInMemory(filters) {
  let items = [...products];
  if (filters.search) items = items.filter(product => product.name.toLowerCase().includes(filters.search.toLowerCase()));
  if (filters.category) {
    const category = categories.find(item => item.slug === filters.category);
    if (category) items = items.filter(product => product.categoryId === category.id);
  }
  if (filters.colour) items = items.filter(product => product.colours.some(colour => colour.toLowerCase() === filters.colour.toLowerCase()));
  if (filters.rating) items = items.filter(product => product.rating >= Number(filters.rating));
  if (filters.featured === 'true') items = items.filter(product => product.isFeatured);
  if (filters.newArrival === 'true') items = items.filter(product => product.isNewArrival);
  if (filters.bestSeller === 'true') items = items.filter(product => product.isBestSeller);
  if (filters.offers === 'true') items = items.filter(product => product.discountPercentage >= 25);
  if (filters.price) {
    const [min, max] = filters.price.split('-').map(Number);
    items = items.filter(product => product.salePrice >= min && product.salePrice <= max);
  }
  const sorters = {
    price_asc: (a, b) => a.salePrice - b.salePrice,
    price_desc: (a, b) => b.salePrice - a.salePrice,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  };
  items.sort(sorters[filters.sort] || sorters.newest);
  return items;
}

export async function list(filters, page, limit) {
  if (!usingDatabase()) {
    syncInMemoryReviewStats();

    const filtered =
      filterProductsInMemory(filters);
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), total: filtered.length };
  }

  const where = [];
  const params = [];
  const push = value => { params.push(value); return `$${params.length}`; };

  if (filters.search) where.push(`(p.name ILIKE ${push(`%${filters.search}%`)} OR p.description ILIKE ${push(`%${filters.search}%`)})`);
  if (filters.category) where.push(`c.slug = ${push(filters.category)}`);
  if (filters.colour) where.push(`EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND lower(v.colour) = lower(${push(filters.colour)}))`);
  if (filters.rating) where.push(`p.rating >= ${push(Number(filters.rating))}`);
  if (filters.featured === 'true') where.push('p.is_featured = TRUE');
  if (filters.newArrival === 'true') where.push('p.is_new_arrival = TRUE');
  if (filters.bestSeller === 'true') where.push('p.is_best_seller = TRUE');
  if (filters.offers === 'true') where.push('p.discount_percentage >= 25');
  if (filters.price) {
    const [min, max] = filters.price.split('-').map(Number);
    if (Number.isFinite(min) && Number.isFinite(max)) where.push(`p.sale_price BETWEEN ${push(min)} AND ${push(max)}`);
  }

  const sorters = {
    price_asc: 'p.sale_price ASC',
    price_desc: 'p.sale_price DESC',
    rating: 'p.rating DESC',
    newest: 'p.created_at DESC'
  };
  const orderBy = sorters[filters.sort] || sorters.newest;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`;
  const { rows: countRows } = await query(countSql, params);

  const limitParam = push(limit);
  const offsetParam = push((page - 1) * limit);
  const listSql = `${BASE_SELECT} ${whereSql} ORDER BY ${orderBy} LIMIT ${limitParam} OFFSET ${offsetParam}`;
  const { rows } = await query(listSql, params);

  return { items: rows.map(mapRow), total: countRows[0].total };
}

export async function getBySlugOrId(idOrSlug) {
  if (!usingDatabase()) {
    syncInMemoryReviewStats();

    return products.find(
      item =>
        item.slug === idOrSlug ||
        item.id === Number(idOrSlug)
    ) || null;
  }
  const isNumeric = /^\d+$/.test(String(idOrSlug));
  const sql = `${BASE_SELECT} WHERE ${isNumeric ? 'p.id = $1' : 'p.slug = $1'}`;
  const { rows } = await query(sql, [isNumeric ? Number(idOrSlug) : idOrSlug]);
  return mapRow(rows[0]) || null;
}

export async function listRelated(categoryId, excludeId, limit = 4) {
  if (!usingDatabase()) {
    return products.filter(item => item.categoryId === categoryId && item.id !== excludeId).slice(0, limit);
  }
  const { rows } = await query(`${BASE_SELECT} WHERE p.category_id = $1 AND p.id != $2 LIMIT $3`, [categoryId, excludeId, limit]);
  return rows.map(mapRow);
}

export async function findByIdForOrder(id) {
  // Used by order calculation: needs salePrice, stockQuantity, variants, name.
  return getBySlugOrId(id);
}

export async function decrementStock(productId, variantId, quantity, client) {
  if (!usingDatabase()) {
    const product = products.find(item => item.id === productId);
    if (product) product.stockQuantity -= quantity;
    return;
  }
  const runner = client || { query };
  await runner.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, productId]);
  if (variantId) await runner.query('UPDATE product_variants SET stock_quantity = GREATEST(stock_quantity - $1, 0) WHERE id = $2', [quantity, variantId]);
}

export async function create(payload) {
  if (!usingDatabase()) {
    const product = { id: products.length + 1, ...payload, createdAt: new Date().toISOString() };
    products.push(product);
    return product;
  }
  const { rows } = await query(
    `INSERT INTO products (category_id, name, slug, description, fabric, original_price, sale_price, discount_percentage, stock_quantity, is_featured, is_new_arrival, is_best_seller)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [payload.categoryId, payload.name, payload.slug, payload.description, payload.fabric || null, payload.originalPrice, payload.salePrice,
    payload.discountPercentage || 0, payload.stockQuantity || 0, Boolean(payload.isFeatured), Boolean(payload.isNewArrival), Boolean(payload.isBestSeller)]
  );
  return getBySlugOrId(rows[0].id);
}

export async function update(id, payload) {
  if (!usingDatabase()) {
    const index = products.findIndex(item => item.id === Number(id));
    if (index === -1) return null;
    products[index] = { ...products[index], ...payload, updatedAt: new Date().toISOString() };
    return products[index];
  }
  const fields = {
    category_id: payload.categoryId, name: payload.name, slug: payload.slug, description: payload.description,
    fabric: payload.fabric, original_price: payload.originalPrice, sale_price: payload.salePrice,
    discount_percentage: payload.discountPercentage, stock_quantity: payload.stockQuantity,
    is_featured: payload.isFeatured, is_new_arrival: payload.isNewArrival, is_best_seller: payload.isBestSeller
  };
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!entries.length) return getBySlugOrId(id);
  const setSql = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
  const { rows } = await query(`UPDATE products SET ${setSql}, updated_at = NOW() WHERE id = $1 RETURNING id`, [id, ...entries.map(([, value]) => value)]);
  if (!rows.length) return null;
  return getBySlugOrId(id);
}

export async function remove(id) {
  if (!usingDatabase()) {
    const index = products.findIndex(item => item.id === Number(id));
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  }
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function listReviews(productId) {
  if (!usingDatabase()) {
    return reviews.filter(
      review =>
        review.productId === Number(productId)
    );
  }
  const { rows } = await query(
    `SELECT *
     FROM reviews
     WHERE product_id = $1
     ORDER BY created_at DESC`,
    [productId]
  );

  return rows.map(row => ({
    id: num(row.id),
    userId: num(row.user_id),
    productId: num(row.product_id),
    orderItemId: row.order_item_id,
    rating: row.rating,
    reviewText: row.review_text,
    reviewImageUrl:
      row.review_image_url || null,
    createdAt: row.created_at
  }));
}
