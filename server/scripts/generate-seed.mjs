// Generates database/seed.sql directly from the existing demo data (data.js)
// so the PostgreSQL-backed store shows the exact same categories, products,
// images and variants as the in-memory demo. Run with: node scripts/generate-seed.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories, products, coupons, users } from '../data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(__dirname, '../../database/seed.sql');

const esc = value => (value === null || value === undefined ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`);
const bool = value => (value ? 'TRUE' : 'FALSE');

let sql = `-- Auto-generated from server/data.js by scripts/generate-seed.mjs\n`;
sql += `-- Preserves the existing DREAM KRAFT LUNGIS catalog, images and demo account.\n`;
sql += `TRUNCATE reviews, order_items, orders, wishlists, cart_items, product_variants, product_images, products, categories, coupons, newsletter_subscribers, users RESTART IDENTITY CASCADE;\n\n`;

sql += `INSERT INTO categories (id, name, slug, description, image_url) VALUES\n`;
sql += categories.map(c => `(${c.id}, ${esc(c.name)}, ${esc(c.slug)}, ${esc(c.description)}, ${esc(c.imageUrl)})`).join(',\n');
sql += `;\nSELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));\n\n`;

sql += `INSERT INTO products (id, category_id, name, slug, description, fabric, original_price, sale_price, discount_percentage, stock_quantity, rating, review_count, is_featured, is_new_arrival, is_best_seller, created_at) VALUES\n`;
sql += products.map(p => `(${p.id}, ${p.categoryId}, ${esc(p.name)}, ${esc(p.slug)}, ${esc(p.description)}, ${esc(p.fabric)}, ${p.originalPrice}, ${p.salePrice}, ${p.discountPercentage}, ${p.stockQuantity}, ${p.rating}, ${p.reviewCount}, ${bool(p.isFeatured)}, ${bool(p.isNewArrival)}, ${bool(p.isBestSeller)}, ${esc(p.createdAt)})`).join(',\n');
sql += `;\nSELECT setval('products_id_seq', (SELECT MAX(id) FROM products));\n\n`;

sql += `INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES\n`;
sql += products.flatMap(p => p.images.map(img => `(${p.id}, ${esc(img.imageUrl)}, ${esc(img.altText)}, ${img.sortOrder})`)).join(',\n');
sql += `;\n\n`;

sql += `INSERT INTO product_variants (product_id, colour, size_or_length, stock_quantity, sku) VALUES\n`;
sql += products.flatMap(p => p.variants.map(v => `(${p.id}, ${esc(v.colour)}, ${esc(v.sizeOrLength)}, ${v.stockQuantity}, ${esc(v.sku)})`)).join(',\n');
sql += `;\n\n`;

sql += `INSERT INTO coupons (id, code, description, discount_type, discount_value, minimum_order_value, maximum_discount, is_active) VALUES\n`;
sql += coupons.map(c => `(${c.id}, ${esc(c.code)}, ${esc(c.description)}, ${esc(c.discountType)}, ${c.discountValue}, ${c.minimumOrderValue}, ${c.maximumDiscount}, ${bool(c.isActive)})`).join(',\n');
sql += `;\nSELECT setval('coupons_id_seq', (SELECT MAX(id) FROM coupons));\n\n`;

sql += `INSERT INTO users (id, name, email, password_hash, phone, role) VALUES\n`;
sql += users.map(u => `(${u.id}, ${esc(u.name)}, ${esc(u.email)}, ${esc(u.passwordHash)}, ${esc(u.phone)}, ${esc(u.role)})`).join(',\n');
sql += `;\nSELECT setval('users_id_seq', (SELECT MAX(id) FROM users));\n`;

fs.writeFileSync(outFile, sql);
console.log(`Wrote ${outFile}`);
