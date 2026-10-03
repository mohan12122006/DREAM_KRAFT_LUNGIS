import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Heart,
  Minus,
  Plus,
  Star,
  ChevronRight,
  ThumbsUp,
  MessageCircle,
  CheckCircle
} from 'lucide-react';

import { Link, useNavigate, useParams } from 'react-router-dom';

import Loading from '../components/Loading.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';

import '../styles/product-details.css';

const getReviewTitle = rating => {
  const value = Number(rating || 0);

  if (value >= 5) return 'Excellent';
  if (value >= 4) return 'Very Good';
  if (value >= 3) return 'Good choice';
  if (value >= 2) return 'Could be better';

  return 'Not recommended';
};

const getReviewText = review =>
  review?.reviewText ||
  review?.review_text ||
  review?.comment ||
  review?.text ||
  '';

const getReviewName = review =>
  review?.customerName ||
  review?.customer_name ||
  review?.userName ||
  review?.user_name ||
  review?.name ||
  review?.user?.name ||
  'Verified Buyer';

const getReviewDate = review =>
  review?.createdAt ||
  review?.created_at ||
  review?.reviewDate ||
  review?.review_date ||
  null;

const formatReviewDate = date => {
  if (!date) {
    return '';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    addItem,
    toggleWishlist
  } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] =
    useState(0);

  const [quantity, setQuantity] =
    useState(1);

  const [variant, setVariant] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [reviewStart, setReviewStart] =
    useState(0);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        const data =
          await api.getProduct(slug);

        if (!active) {
          return;
        }

        setProduct(data);

        setVariant(
          data?.variants?.[0]?.id ||
            null
        );
      } catch (error) {
        console.error(
          'Failed to load product:',
          error
        );
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      if (!product?.id) {
        return;
      }

      try {
        setReviewsLoading(true);

        const response =
          await api.getReviews(product.id);

        const reviewData =
          response?.reviews ||
          response?.data ||
          response;

        if (active) {
          setReviews(
            Array.isArray(reviewData)
              ? reviewData
              : []
          );
        }
      } catch (error) {
        console.error(
          'Failed to load reviews:',
          error
        );

        if (active) {
          setReviews([]);
        }
      } finally {
        if (active) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      active = false;
    };
  }, [product?.id]);

  const visibleReviews = useMemo(() => {
    return reviews.slice(
      reviewStart,
      reviewStart + 4
    );
  }, [reviews, reviewStart]);

  const image =
    product?.images?.[selectedImage] ||
    product?.images?.[0];

  const buyNow = async () => {
    await addItem(
      product,
      quantity,
      variant
    );

    navigate('/checkout');
  };

  if (!product) {
    return (
      <section className="content-section">
        <Loading />
      </section>
    );
  }

  return (
    <section className="product-detail content-section">

      {/* PRODUCT */}

      <div className="gallery">
        {image && (
          <img
            className="gallery-main"
            src={image.imageUrl}
            alt={image.altText}
          />
        )}

        <div className="thumb-row">
          {product.images?.map(
            (item, index) => (
              <button
                key={item.imageUrl}
                type="button"
                onClick={() =>
                  setSelectedImage(index)
                }
                aria-label={`View ${item.altText}`}
              >
                <img
                  src={item.imageUrl}
                  alt=""
                />
              </button>
            )
          )}
        </div>
      </div>

      <div className="detail-info">

        <p className="eyebrow">
          {product.categoryName}
        </p>

        <h1>{product.name}</h1>

        <div className="rating-row">
          <Star
            size={18}
            fill="currentColor"
          />

          {product.rating || 0} rating from{' '}
          {product.reviewCount || 0} reviews
        </div>

        <div className="detail-price">
          <strong>
            {formatMoney(
              product.salePrice
            )}
          </strong>

          <del>
            {formatMoney(
              product.originalPrice
            )}
          </del>

          <span>
            {product.discountPercentage}% OFF
          </span>
        </div>

        <p>
          {product.description}
        </p>

        <label>
          Colour and length

          <select
            value={variant || ''}
            onChange={event =>
              setVariant(
                event.target.value
              )
            }
          >
            {product.variants?.map(
              item => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.colour} -{' '}
                  {item.sizeOrLength}
                </option>
              )
            )}
          </select>
        </label>

        <div
          className="quantity-control"
          aria-label="Quantity selector"
        >
          <button
            type="button"
            onClick={() =>
              setQuantity(value =>
                Math.max(
                  1,
                  value - 1
                )
              )
            }
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={() =>
              setQuantity(value =>
                value + 1
              )
            }
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <p
          className={
            product.stockQuantity > 0
              ? 'stock-ok'
              : 'stock-bad'
          }
        >
          {product.stockQuantity > 0
            ? `${product.stockQuantity} pieces available`
            : 'Out of stock'}
        </p>

        <div className="detail-actions">
          <button
            className="btn btn-primary"
            disabled={
              !product.stockQuantity
            }
            onClick={() =>
              addItem(
                product,
                quantity,
                variant
              )
            }
          >
            Add to Cart
          </button>

          <button
            className="btn"
            disabled={
              !product.stockQuantity
            }
            onClick={buyNow}
          >
            Buy Now
          </button>

          <button
            className="icon-button"
            onClick={() =>
              toggleWishlist(product)
            }
            aria-label="Add to wishlist"
          >
            <Heart />
          </button>
        </div>

        <div className="spec-box">
          <h2>
            Product Specifications
          </h2>

          <ul>
            <li>
              Premium cotton fabric
            </li>
            <li>
              Soft and breathable
            </li>
            <li>
              Comfortable for daily use
            </li>
            <li>
              Traditional Indian design
            </li>
            <li>
              Easy to wash
            </li>
            <li>
              Durable fabric
            </li>
          </ul>
        </div>
      </div>

      {/* =================================================
          REVIEWS
      ================================================= */}

      <section className="product-reviews-section">

        <div className="product-reviews-header">
          <div>
            <p className="eyebrow">
              CUSTOMER FEEDBACK
            </p>

            <h2>
              Customer Reviews
            </h2>

            <p className="reviews-summary">
              {product.rating || 0} out of 5{' '}
              <Star
                size={16}
                fill="currentColor"
              />{' '}
              · {reviews.length} reviews
            </p>
          </div>

          {reviews.length > 4 && (
            <button
              type="button"
              className="reviews-next-button"
              onClick={() =>
                setReviewStart(
                  current =>
                    current + 4 >=
                    reviews.length
                      ? 0
                      : current + 4
                )
              }
              aria-label="Next reviews"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {reviewsLoading ? (
          <div className="reviews-loading">
            <Loading />
          </div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <Star size={28} />

            <h3>
              No reviews yet
            </h3>

            <p>
              Be the first customer to
              review this product.
            </p>
          </div>
        ) : (
          <>
            <div className="reviews-slider">
              {visibleReviews.map(
                (review, index) => {
                  const rating = Number(
                    review.rating || 0
                  );

                  const reviewText =
                    getReviewText(review);

                  const customerName =
                    getReviewName(review);

                  const reviewDate =
                    formatReviewDate(
                      getReviewDate(
                        review
                      )
                    );

                  return (
                    <article
                      className="review-card"
                      key={
                        review.id ||
                        `${review.orderItemId || index}-${index}`
                      }
                    >
                      {/* TOP */}

                      <div className="review-card-top">

                        <div className="review-rating">
                          <span>
                            {rating}
                          </span>

                          <Star
                            size={13}
                            fill="currentColor"
                          />
                        </div>

                        <h3>
                          {getReviewTitle(
                            rating
                          )}
                        </h3>

                        {reviewDate && (
                          <time>
                            {reviewDate}
                          </time>
                        )}
                      </div>

                      {/* TEXT */}

                      <p className="review-text">
                        {reviewText ||
                          'Customer review'}
                      </p>

                      {/* CUSTOMER */}

                      <div className="review-customer">

                        <div>
                          <strong>
                            {customerName}
                          </strong>

                          <span>
                            <CheckCircle
                              size={14}
                            />
                            Verified Buyer
                          </span>
                        </div>

                        <div className="review-actions">

                          {review.helpfulCount !==
                            undefined && (
                            <span>
                              <ThumbsUp
                                size={15}
                              />
                              {
                                review.helpfulCount
                              }
                            </span>
                          )}

                          {review.replyCount !==
                            undefined && (
                            <span>
                              <MessageCircle
                                size={15}
                              />
                              {
                                review.replyCount
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            <Link
              to={`/products/${product.slug || slug}/reviews`}
              className="show-all-reviews"
            >
              Show all reviews
              <ChevronRight size={19} />
            </Link>
          </>
        )}
      </section>

      {/* RELATED PRODUCTS */}

      <section className="related-products">
        <h2>
          Related Products
        </h2>

        <div className="product-grid">
          {product.related?.map(
            item => (
              <ProductCard
                key={item.id}
                product={item}
              />
            )
          )}
        </div>

        <Link
          className="btn"
          to="/shop"
        >
          View all lungis
        </Link>
      </section>

    </section>
  );
}