import { reviews, products } from '../data.js';
import { num, query, usingDatabase } from './db.js';

export async function exists(
  userId,
  productId,
  orderItemId
) {
  if (!usingDatabase()) {
    return reviews.some(
      review =>
        review.userId === userId &&
        review.productId === productId &&
        review.orderItemId === orderItemId
    );
  }

  const { rows } = await query(
    `SELECT 1
     FROM reviews
     WHERE user_id = $1
       AND product_id = $2
       AND order_item_id = $3`,
    [
      userId,
      productId,
      orderItemId
    ]
  );

  return rows.length > 0;
}

export async function create({
  userId,
  productId,
  orderItemId,
  rating,
  reviewText,
  reviewImageUrl = null
}) {
  if (!usingDatabase()) {
    const review = {
      id: reviews.length + 1,
      userId,
      productId,
      orderItemId,
      rating: Number(rating),
      reviewText,
      reviewImageUrl,
      createdAt: new Date().toISOString()
    };

    reviews.push(review);

    /*
     * Update product rating and review count
     * for the in-memory/demo data.
     */
    const product = products.find(
      item => Number(item.id) === Number(productId)
    );

    if (product) {
      const productReviews = reviews.filter(
        item =>
          Number(item.productId) === Number(productId)
      );

      const totalRating = productReviews.reduce(
        (total, item) =>
          total + Number(item.rating || 0),
        0
      );

      product.reviewCount = productReviews.length;

      product.rating =
        productReviews.length > 0
          ? Number(
              (
                totalRating /
                productReviews.length
              ).toFixed(1)
            )
          : 0;
    }

    return review;
  }

  /*
   * Insert the new review.
   */
  const { rows } = await query(
    `INSERT INTO reviews (
       user_id,
       product_id,
       order_item_id,
       rating,
       review_text,
       review_image_url
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      productId,
      orderItemId,
      rating,
      reviewText,
      reviewImageUrl
    ]
  );

  const row = rows[0];

  /*
   * Recalculate the product's review count
   * and average rating.
   */
  await query(
    `UPDATE products
     SET
       review_count = (
         SELECT COUNT(*)
         FROM reviews
         WHERE product_id = $1
       ),
       rating = COALESCE(
         (
           SELECT ROUND(AVG(rating)::numeric, 1)
           FROM reviews
           WHERE product_id = $1
         ),
         0
       ),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [productId]
  );

  return {
    id: num(row.id),
    userId: num(row.user_id),
    productId: num(row.product_id),
    orderItemId: num(row.order_item_id),
    rating: Number(row.rating),
    reviewText: row.review_text,
    reviewImageUrl:
      row.review_image_url || null,
    createdAt: row.created_at
  };
}