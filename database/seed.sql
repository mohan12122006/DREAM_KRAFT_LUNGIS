-- Auto-generated from server/data.js by scripts/generate-seed.mjs
-- Preserves the existing DREAM KRAFT LUNGIS catalog, images and demo account.
TRUNCATE reviews, order_items, orders, wishlists, cart_items, product_variants, product_images, products, categories, coupons, newsletter_subscribers, users RESTART IDENTITY CASCADE;

INSERT INTO categories (id, name, slug, description, image_url) VALUES
(1, 'Cotton Lungis', 'cotton-lungis', 'Soft everyday cotton styles for all-season comfort.', '/images/categories/category-cotton-lungis.jpg'),
(2, 'Premium Lungis', 'premium-lungis', 'Fine cotton, richer borders and refined finishes.', '/images/categories/category-premium-lungis.jpg'),
(3, 'Checked Lungis', 'checked-lungis', 'Classic checks in breathable cotton colourways.', '/images/categories/category-checked-lungis.jpg'),
(4, 'Plain Lungis', 'plain-lungis', 'Minimal traditional solids for relaxed daily wear.', '/images/categories/category-plain-lungis.jpg'),
(5, 'Traditional Collection', 'traditional-collection', 'Heritage-inspired patterns and trusted comfort.', '/images/categories/category-traditional.jpg'),
(6, 'New Arrivals', 'new-arrivals', 'Fresh colours, borders and seasonal picks.', '/images/categories/category-new-arrivals.jpg'),
(7, 'Best Sellers', 'best-sellers', 'Customer-loved lungis chosen again and again.', '/images/categories/category-best-sellers.jpg'),
(8, 'Festival Collection', 'festival-collection', 'Dressier traditional styles for festive moments.', '/images/categories/category-festival.jpg');
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

INSERT INTO products (id, category_id, name, slug, description, fabric, original_price, sale_price, discount_percentage, stock_quantity, rating, review_count, is_featured, is_new_arrival, is_best_seller, created_at) VALUES
(1, 1, 'Premium Blue Cotton Lungi', 'premium-blue-cotton-lungi', 'Premium Blue Cotton Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 699, 499, 29, 34, 4.8, 128, TRUE, TRUE, TRUE, '2026-09-22T18:11:34.154Z'),
(2, 3, 'Classic Checked Cotton Lungi', 'classic-checked-cotton-lungi', 'Classic Checked Cotton Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 549, 399, 27, 41, 4.6, 94, TRUE, FALSE, TRUE, '2026-09-21T18:11:34.154Z'),
(3, 2, 'Premium Green Cotton Lungi', 'premium-green-cotton-lungi', 'Premium Green Cotton Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 749, 549, 27, 48, 4.7, 82, TRUE, TRUE, FALSE, '2026-09-20T18:11:34.154Z'),
(4, 5, 'Traditional White Lungi', 'traditional-white-lungi', 'Traditional White Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 599, 449, 25, 55, 4.5, 76, TRUE, FALSE, FALSE, '2026-09-19T18:11:34.154Z'),
(5, 1, 'Soft Comfort Cotton Lungi', 'soft-comfort-cotton-lungi', 'Soft Comfort Cotton Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 649, 499, 23, 62, 4.8, 116, TRUE, FALSE, TRUE, '2026-09-18T18:11:34.154Z'),
(6, 2, 'Premium Border Lungi', 'premium-border-lungi', 'Premium Border Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 799, 599, 25, 69, 4.9, 143, TRUE, TRUE, TRUE, '2026-09-17T18:11:34.154Z'),
(7, 8, 'Festival Maroon Lungi', 'festival-maroon-lungi', 'Festival Maroon Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 899, 649, 28, 76, 4.6, 51, FALSE, TRUE, FALSE, '2026-09-16T18:11:34.154Z'),
(8, 4, 'Daily Plain Navy Lungi', 'daily-plain-navy-lungi', 'Daily Plain Navy Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 529, 379, 28, 0, 4.4, 39, FALSE, FALSE, FALSE, '2026-09-15T18:11:34.154Z'),
(9, 3, 'Heritage Checked Green Lungi', 'heritage-checked-green-lungi', 'Heritage Checked Green Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 679, 479, 29, 90, 4.7, 67, FALSE, FALSE, TRUE, '2026-09-14T18:11:34.154Z'),
(10, 5, 'Temple Border White Lungi', 'temple-border-white-lungi', 'Temple Border White Lungi is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.', 'Premium cotton', 829, 599, 28, 97, 4.8, 88, FALSE, TRUE, FALSE, '2026-09-13T18:11:34.155Z');
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES
(1, '/images/products/blue-lungi-1.jpg', 'Premium Blue Cotton Lungi product image 1', 1),
(1, '/images/products/detail-blue-lungi.jpg', 'Premium Blue Cotton Lungi product image 2', 2),
(1, '/images/products/blue-lungi-2.jpg', 'Premium Blue Cotton Lungi product image 3', 3),
(2, '/images/products/checked-lungi-1.jpg', 'Classic Checked Cotton Lungi product image 1', 1),
(2, '/images/products/detail-checked-lungi.jpg', 'Classic Checked Cotton Lungi product image 2', 2),
(2, '/images/products/green-lungi-1.jpg', 'Classic Checked Cotton Lungi product image 3', 3),
(3, '/images/products/green-lungi-1.jpg', 'Premium Green Cotton Lungi product image 1', 1),
(3, '/images/products/detail-blue-lungi.jpg', 'Premium Green Cotton Lungi product image 2', 2),
(3, '/images/products/blue-lungi-2.jpg', 'Premium Green Cotton Lungi product image 3', 3),
(4, '/images/products/white-lungi-1.jpg', 'Traditional White Lungi product image 1', 1),
(4, '/images/products/detail-border.jpg', 'Traditional White Lungi product image 2', 2),
(4, '/images/products/premium-border-lungi.jpg', 'Traditional White Lungi product image 3', 3),
(5, '/images/products/blue-lungi-2.jpg', 'Soft Comfort Cotton Lungi product image 1', 1),
(5, '/images/products/detail-blue-lungi.jpg', 'Soft Comfort Cotton Lungi product image 2', 2),
(5, '/images/products/blue-lungi-1.jpg', 'Soft Comfort Cotton Lungi product image 3', 3),
(6, '/images/products/premium-border-lungi.jpg', 'Premium Border Lungi product image 1', 1),
(6, '/images/products/detail-border.jpg', 'Premium Border Lungi product image 2', 2),
(6, '/images/products/white-lungi-1.jpg', 'Premium Border Lungi product image 3', 3),
(7, '/images/products/brown-lungi.jpg', 'Festival Maroon Lungi product image 1', 1),
(7, '/images/products/detail-border.jpg', 'Festival Maroon Lungi product image 2', 2),
(7, '/images/products/premium-border-lungi.jpg', 'Festival Maroon Lungi product image 3', 3),
(8, '/images/products/black-lungi.jpg', 'Daily Plain Navy Lungi product image 1', 1),
(8, '/images/products/detail-blue-lungi.jpg', 'Daily Plain Navy Lungi product image 2', 2),
(8, '/images/products/brown-lungi.jpg', 'Daily Plain Navy Lungi product image 3', 3),
(9, '/images/products/green-lungi-1.jpg', 'Heritage Checked Green Lungi product image 1', 1),
(9, '/images/products/detail-checked-lungi.jpg', 'Heritage Checked Green Lungi product image 2', 2),
(9, '/images/products/checked-lungi-1.jpg', 'Heritage Checked Green Lungi product image 3', 3),
(10, '/images/products/white-lungi-1.jpg', 'Temple Border White Lungi product image 1', 1),
(10, '/images/products/detail-border.jpg', 'Temple Border White Lungi product image 2', 2),
(10, '/images/products/premium-border-lungi.jpg', 'Temple Border White Lungi product image 3', 3);

INSERT INTO product_variants (product_id, colour, size_or_length, stock_quantity, sku) VALUES
(1, 'Blue', '2.0 m', 12, 'DKL-100'),
(1, 'Blue', '2.2 m', 13, 'DKL-101'),
(1, 'White', '2.0 m', 12, 'DKL-110'),
(1, 'White', '2.2 m', 13, 'DKL-111'),
(2, 'Blue', '2.0 m', 12, 'DKL-200'),
(2, 'Blue', '2.2 m', 13, 'DKL-201'),
(2, 'Green', '2.0 m', 12, 'DKL-210'),
(2, 'Green', '2.2 m', 13, 'DKL-211'),
(3, 'Green', '2.0 m', 12, 'DKL-300'),
(3, 'Green', '2.2 m', 13, 'DKL-301'),
(3, 'Gold', '2.0 m', 12, 'DKL-310'),
(3, 'Gold', '2.2 m', 13, 'DKL-311'),
(4, 'White', '2.0 m', 12, 'DKL-400'),
(4, 'White', '2.2 m', 13, 'DKL-401'),
(4, 'Gold', '2.0 m', 12, 'DKL-410'),
(4, 'Gold', '2.2 m', 13, 'DKL-411'),
(5, 'Maroon', '2.0 m', 12, 'DKL-500'),
(5, 'Maroon', '2.2 m', 13, 'DKL-501'),
(5, 'Blue', '2.0 m', 12, 'DKL-510'),
(5, 'Blue', '2.2 m', 13, 'DKL-511'),
(6, 'White', '2.0 m', 12, 'DKL-600'),
(6, 'White', '2.2 m', 13, 'DKL-601'),
(6, 'Maroon', '2.0 m', 12, 'DKL-610'),
(6, 'Maroon', '2.2 m', 13, 'DKL-611'),
(7, 'Maroon', '2.0 m', 12, 'DKL-700'),
(7, 'Maroon', '2.2 m', 13, 'DKL-701'),
(7, 'Gold', '2.0 m', 12, 'DKL-710'),
(7, 'Gold', '2.2 m', 13, 'DKL-711'),
(8, 'Navy', '2.0 m', 12, 'DKL-800'),
(8, 'Navy', '2.2 m', 13, 'DKL-801'),
(8, 'Blue', '2.0 m', 12, 'DKL-810'),
(8, 'Blue', '2.2 m', 13, 'DKL-811'),
(9, 'Green', '2.0 m', 12, 'DKL-900'),
(9, 'Green', '2.2 m', 13, 'DKL-901'),
(9, 'White', '2.0 m', 12, 'DKL-910'),
(9, 'White', '2.2 m', 13, 'DKL-911'),
(10, 'White', '2.0 m', 12, 'DKL-1000'),
(10, 'White', '2.2 m', 13, 'DKL-1001'),
(10, 'Red', '2.0 m', 12, 'DKL-1010'),
(10, 'Red', '2.2 m', 13, 'DKL-1011');

INSERT INTO coupons (id, code, description, discount_type, discount_value, minimum_order_value, maximum_discount, is_active) VALUES
(1, 'FESTIVE30', 'Special Festival Offers', 'percentage', 30, 999, 300, TRUE),
(2, 'FREEDEL', 'Free Delivery on Selected Orders', 'delivery', 49, 499, 49, TRUE);
SELECT setval('coupons_id_seq', (SELECT MAX(id) FROM coupons));

INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
(1, 'Demo Customer', 'demo@dreamkraftlungis.in', '$2a$10$kF5ThUM0apmWSZdN5YS16O9V6Gq7d8I7HrNURZiaKqpHkK3Gfw7Qy', '9876543210', 'customer');
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
