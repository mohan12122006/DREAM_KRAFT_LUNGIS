import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';

export default function ProductCard({ product }) {
  const {
    addItem,
    toggleWishlist,
    wishlist
  } = useCart();

  const navigate = useNavigate();

  const [reviewCount, setReviewCount] = useState(
    Number(
      product?.reviewCount ??
      product?.review_count ??
      0
    )
  );

  const [rating, setRating] = useState(
    Number(product?.rating ?? 0)
  );

  const [reviewsLoaded, setReviewsLoaded] =
    useState(false);

  const wished = wishlist.some(
    item =>
      item.id === product.id ||
      item.product?.id === product.id
  );

  const disabled =
    Number(product?.stockQuantity || 0) <= 0;

  /*
   * LOAD REAL REVIEWS
   *
   * Do not depend only on product.reviewCount.
   * The reviews table is the source of truth.
   */
  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      if (!product?.id) {
        return;
      }

      try {
        const response =
          await api.getReviews(product.id);

        const reviews =
          response?.reviews ||
          response?.data ||
          response;

        if (!active || !Array.isArray(reviews)) {
          return;
        }

        const validReviews = reviews.filter(
          review =>
            Number(review?.rating || 0) > 0
        );

        const count = validReviews.length;

        const average =
          count > 0
            ? validReviews.reduce(
                (total, review) =>
                  total +
                  Number(review.rating || 0),
                0
              ) / count
            : 0;

        setReviewCount(count);
        setRating(average);
        setReviewsLoaded(true);
      } catch (error) {
        console.error(
          'Failed to load product reviews:',
          error
        );
      }
    };

    loadReviews();

    return () => {
      active = false;
    };
  }, [product?.id]);

  const buyNow = async () => {
    const ok = await addItem(product);

    if (ok !== undefined) {
      navigate('/checkout');
    }
  };

  return (
    <article className="product-card">

      {/* PRODUCT IMAGE */}
      <Link
        className="product-image"
        to={`/products/${product.slug}`}
      >
        <img
          src={
            product.images?.[0]?.imageUrl ||
            product.images?.[0]?.image_url ||
            product.imageUrl ||
            product.image_url
          }
          alt={
            product.images?.[0]?.altText ||
            product.images?.[0]?.alt_text ||
            product.name
          }
          loading="lazy"
        />

        <span>
          {product.stockQuantity > 0
            ? 'In Stock'
            : 'Out of Stock'}
        </span>
      </Link>

      <div className="product-card-body">

        {/* RATING + REVIEW COUNT */}
        <div className="rating-row">
          <Star
            size={16}
            fill="currentColor"
          />

          <strong>
            {rating > 0
              ? rating.toFixed(1)
              : '0'}
          </strong>

          <small>
            ({reviewCount})
          </small>
        </div>

        {/* PRODUCT NAME */}
        <Link
          className="product-title"
          to={`/products/${product.slug}`}
        >
          {product.name}
        </Link>

        {/* PRICE */}
        <div className="price-row">
          <strong>
            {formatMoney(product.salePrice)}
          </strong>

          <del>
            {formatMoney(product.originalPrice)}
          </del>

          <span>
            {product.discountPercentage}% OFF
          </span>
        </div>

        {/* COLOURS */}
        <div
          className="swatches"
          aria-label="Available colours"
        >
          {(product.colours || []).map(
            colour => (
              <i
                key={colour}
                title={colour}
                style={{
                  background: colour
                }}
              />
            )
          )}
        </div>

        {/* ACTIONS */}
        <div className="product-actions">

          <button
            className={`icon-button wishlist-toggle ${
              wished ? 'active' : ''
            }`}
            type="button"
            aria-label="Toggle wishlist"
            onClick={() =>
              toggleWishlist(product)
            }
          >
            <Heart
              size={18}
              fill={
                wished
                  ? 'currentColor'
                  : 'none'
              }
            />
          </button>

          <button
            className="btn btn-small"
            type="button"
            disabled={disabled}
            onClick={() =>
              addItem(product)
            }
          >
            <ShoppingBag size={16} />
            Add
          </button>

          <button
            className="btn btn-small btn-primary"
            type="button"
            disabled={disabled}
            onClick={buyNow}
          >
            Buy Now
          </button>

        </div>
      </div>
    </article>
  );
}