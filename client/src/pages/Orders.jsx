import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  ImagePlus,
  MapPin,
  Package,
  Star,
  Truck,
  Upload,
  X
} from 'lucide-react';

import { Link } from 'react-router-dom';

import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';

import '../styles/orders.css';

/* =========================================================
   STATUS LABELS
========================================================= */

const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

/* =========================================================
   STATUS STEPS
========================================================= */

const STATUS_STEPS = [
  {
    key: 'pending',
    label: 'Order Placed',
    icon: Clock3
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: Check
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: Package
  },
  {
    key: 'packed',
    label: 'Packed',
    icon: Package
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: Truck
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: Check
  }
];

/* =========================================================
   REVIEW STORAGE
========================================================= */

const REVIEWED_STORAGE_KEY =
  'dkl_reviewed_order_items';

function getReviewedOrderItems() {
  try {
    const stored = localStorage.getItem(
      REVIEWED_STORAGE_KEY
    );

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);

    return parsed &&
      typeof parsed === 'object'
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function saveReviewedOrderItem(
  orderItemId,
  review
) {
  const current =
    getReviewedOrderItems();

  current[String(orderItemId)] = {
    rating: Number(
      review?.rating || 0
    ),

    reviewText: String(
      review?.reviewText || ''
    ),

    reviewImageUrl:
      review?.reviewImageUrl || null,

    submittedAt:
      new Date().toISOString()
  };

  localStorage.setItem(
    REVIEWED_STORAGE_KEY,
    JSON.stringify(current)
  );
}

/* =========================================================
   STATUS INDEX
========================================================= */

function getStatusIndex(status) {
  const normalized = String(
    status || 'pending'
  ).toLowerCase();

  if (normalized === 'cancelled') {
    return -1;
  }

  const index =
    STATUS_STEPS.findIndex(
      step => step.key === normalized
    );

  return index >= 0 ? index : 0;
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ item }) {
  const [image, setImage] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function loadImage() {
      try {
        setLoading(true);

        const product =
          await api.getProduct(
            item.productId
          );

        if (!active) {
          return;
        }

        const imageUrl =
          product?.images?.[0]
            ?.imageUrl ||
          product?.images?.[0]
            ?.image_url ||
          product?.imageUrl ||
          product?.image_url ||
          '';

        setImage(imageUrl);
      } catch {
        if (active) {
          setImage('');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (item.productId) {
      loadImage();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [item.productId]);

  if (loading) {
    return (
      <div className="order-product-image loading-image">
        <Package size={34} />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="order-product-image no-image">
        <Package size={38} />
        <span>No Image</span>
      </div>
    );
  }

  return (
    <img
      className="order-product-image"
      src={image}
      alt={
        item.productName ||
        'Ordered product'
      }
      loading="lazy"
      onError={event => {
        event.currentTarget.style.display =
          'none';
      }}
    />
  );
}

/* =========================================================
   ORDER PROGRESS
========================================================= */

function OrderProgress({ status }) {
  const currentIndex =
    getStatusIndex(status);

  return (
    <div className="order-progress">
      {STATUS_STEPS.map(
        (step, index) => {
          const Icon = step.icon;

          const completed =
            index <= currentIndex;

          const current =
            index === currentIndex;

          return (
            <div
              className={`order-step ${
                completed
                  ? 'completed'
                  : ''
              } ${
                current
                  ? 'current'
                  : ''
              }`}
              key={step.key}
            >
              <div className="order-step-icon">
                <Icon size={17} />
              </div>

              <span>
                {step.label}
              </span>

              {index <
                STATUS_STEPS.length - 1 && (
                <div
                  className={`order-step-line ${
                    index <
                    currentIndex
                      ? 'completed'
                      : ''
                  }`}
                />
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   FEEDBACK MODAL
========================================================= */

function FeedbackModal({
  item,
  onClose,
  onSubmitted
}) {
  const [rating, setRating] =
    useState(0);

  const [hoverRating, setHoverRating] =
    useState(0);

  const [reviewText, setReviewText] =
    useState('');

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState('');

  const [error, setError] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  function handleImageChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        'Please upload a JPG, PNG, or WEBP image.'
      );

      event.target.value = '';

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        'Image size must be 5MB or less.'
      );

      event.target.value = '';

      return;
    }

    setImageFile(file);

    const reader =
      new FileReader();

    reader.onload = () => {
      setImagePreview(
        reader.result
      );
    };

    reader.onerror = () => {
      setError(
        'Unable to read the selected image.'
      );

      setImageFile(null);
      setImagePreview('');
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview('');

    const input =
      document.getElementById(
        'feedback-photo-input'
      );

    if (input) {
      input.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!rating) {
      setError(
        'Please select a rating.'
      );
      return;
    }

    if (!reviewText.trim()) {
      setError(
        'Please write your feedback.'
      );
      return;
    }

    if (
      reviewText.trim().length < 3
    ) {
      setError(
        'Feedback must contain at least 3 characters.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const reviewImageUrl =
        imageFile && imagePreview
          ? imagePreview
          : null;

      const savedReview = {
        rating,
        reviewText:
          reviewText.trim(),
        reviewImageUrl
      };

      await api.submitReview(
        item.productId,
        {
          orderItemId: item.id,
          rating,
          reviewText:
            reviewText.trim(),
          reviewImageUrl
        }
      );

      saveReviewedOrderItem(
        item.id,
        savedReview
      );

      setSubmitted(true);

      if (onSubmitted) {
        onSubmitted(
          item.id,
          savedReview
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          'Unable to submit your feedback. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="feedback-modal-overlay"
        role="dialog"
        aria-modal="true"
      >
        <div className="feedback-modal feedback-submitted-modal">
          <button
            type="button"
            className="feedback-close"
            onClick={onClose}
            aria-label="Close feedback"
          >
            <X size={22} />
          </button>

          <div className="feedback-submitted">
            <div className="feedback-submitted-icon">
              <Check size={34} />
            </div>

            <h2>
              Feedback Submitted
            </h2>

            <p>
              Thank you for sharing your
              experience with DREAM KRAFT
              LUNGIS.
            </p>

            <button
              type="button"
              className="feedback-submit"
              onClick={onClose}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="feedback-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="feedback-modal">
        <button
          type="button"
          className="feedback-close"
          onClick={onClose}
          aria-label="Close feedback"
        >
          <X size={22} />
        </button>

        <div className="feedback-header">
          <div className="feedback-icon">
            <Star size={24} />
          </div>

          <div>
            <span className="feedback-eyebrow">
              YOUR EXPERIENCE
            </span>

            <h2 id="feedback-title">
              Rate & Review
            </h2>

            <p>
              Share your experience with
              this product.
            </p>
          </div>
        </div>

        <form
          className="feedback-form"
          onSubmit={handleSubmit}
        >
          <div className="feedback-rating-section">
            <label>
              Your Rating
            </label>

            <div
              className="feedback-stars"
              onMouseLeave={() =>
                setHoverRating(0)
              }
            >
              {[1, 2, 3, 4, 5].map(
                star => (
                  <button
                    key={star}
                    type="button"
                    className={`feedback-star ${
                      star <=
                      (
                        hoverRating ||
                        rating
                      )
                        ? 'selected'
                        : ''
                    }`}
                    onMouseEnter={() =>
                      setHoverRating(
                        star
                      )
                    }
                    onClick={() =>
                      setRating(
                        star
                      )
                    }
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <Star
                      size={31}
                      fill={
                        star <=
                        (
                          hoverRating ||
                          rating
                        )
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                )
              )}
            </div>

            {rating > 0 && (
              <span className="feedback-rating-text">
                {rating === 1 &&
                  'Poor'}

                {rating === 2 &&
                  'Fair'}

                {rating === 3 &&
                  'Good'}

                {rating === 4 &&
                  'Very Good'}

                {rating === 5 &&
                  'Excellent'}
              </span>
            )}
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-text">
              Your Feedback
            </label>

            <textarea
              id="feedback-text"
              value={reviewText}
              onChange={event =>
                setReviewText(
                  event.target.value
                )
              }
              placeholder="Tell us about the quality, comfort and your experience..."
              rows={5}
              maxLength={1000}
              disabled={submitting}
            />

            <div className="feedback-character-count">
              {reviewText.length}/1000
            </div>
          </div>

          <div className="feedback-field">
            <label>
              Add Product Photo

              <span className="optional-label">
                Optional
              </span>
            </label>

            {!imagePreview ? (
              <label
                className="photo-upload-box"
                htmlFor="feedback-photo-input"
              >
                <input
                  id="feedback-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  disabled={submitting}
                  hidden
                />

                <div className="photo-upload-icon">
                  <ImagePlus size={27} />
                </div>

                <div>
                  <strong>
                    Upload a photo
                  </strong>

                  <span>
                    JPG, PNG or WEBP · Max 5MB
                  </span>
                </div>

                <Upload
                  size={19}
                  className="photo-upload-arrow"
                />
              </label>
            ) : (
              <div className="photo-preview-box">
                <img
                  src={imagePreview}
                  alt="Feedback preview"
                />

                <div className="photo-preview-info">
                  <div>
                    <strong>
                      Photo selected
                    </strong>

                    <span>
                      {imageFile?.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                    className="photo-remove-button"
                    aria-label="Remove photo"
                    disabled={
                      submitting
                    }
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="feedback-error">
              <X size={17} />

              <span>
                {error}
              </span>
            </div>
          )}

          <div className="feedback-actions">
            <button
              type="button"
              className="feedback-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="feedback-submit"
              disabled={submitting}
            >
              {submitting
                ? 'SUBMITTING...'
                : 'SUBMIT FEEDBACK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT ORDER CARD
========================================================= */

function ProductOrderCard({
  item,
  orderCancelled,
  orderDelivered,
  review,
  onFeedback,
  canCancel,
  onCancel,
  cancelling
}) {
  const productPath =
    item.slug ||
    item.productSlug ||
    item.productId;

  const itemPrice = Number(
    item.totalPrice ??
      Number(
        item.unitPrice ??
          item.price ??
          0
      ) *
        Number(
          item.quantity ?? 1
        )
  );

  const itemStatus =
    String(
      item.sellerStatus ||
        item.seller_status ||
        item.status ||
        ''
    ).toLowerCase();

  const isItemCancelled =
    orderCancelled ||
    itemStatus === 'cancelled';

  const isItemDelivered =
    !isItemCancelled &&
    (orderDelivered ||
      itemStatus === 'delivered');

  return (
    <div className="order-product-row">

      {/* PRODUCT IMAGE */}

      <div className="order-product-image-wrap">
        <Link
          to={`/products/${productPath}`}
        >
          <ProductImage
            item={item}
          />
        </Link>
      </div>

      {/* PRODUCT DETAILS */}

      <div className="order-product-details">
        <Link
          to={`/products/${productPath}`}
          className="order-product-name"
        >
          {item.productName}
        </Link>

        {item.colour && (
          <div className="order-product-colour">
            Colour: {item.colour}
          </div>
        )}

        {item.sizeOrLength && (
          <div className="order-product-colour">
            Size / Length:{' '}
            {item.sizeOrLength}
          </div>
        )}

        <div className="order-product-quantity">
          Quantity:{' '}
          {item.quantity || 1}
        </div>

        <strong className="mobile-order-price">
          {formatMoney(itemPrice)}
        </strong>
      </div>

      {/* PRICE */}

      <div className="order-product-price">
        {formatMoney(itemPrice)}
      </div>

      {/* DELIVERY / STATUS */}

      <div className="order-product-delivery">

        <div className="delivery-status">
          <span
            className={`delivery-dot ${
              isItemCancelled
                ? 'cancelled'
                : isItemDelivered
                  ? 'delivered'
                  : ''
            }`}
          />

          <strong>
            {isItemCancelled
              ? 'Cancelled'
              : isItemDelivered
                ? 'Delivered'
                : 'Order Active'}
          </strong>
        </div>

        {isItemCancelled ? (
          <div className="delivery-message cancelled">
            This product has been
            cancelled.
          </div>
        ) : isItemDelivered ? (
          <div className="delivery-message delivered">
            Your item has been
            delivered successfully.
          </div>
        ) : (
          <>
            <div className="delivery-message">
              Your item is being
              processed.
            </div>

            {/* CANCEL BUTTON */}

            {canCancel && (
              <button
                type="button"
                className="order-cancel-button"
                onClick={() =>
                  onCancel(item)
                }
                disabled={cancelling}
              >
                {cancelling
                  ? 'CANCELLING...'
                  : 'CANCEL ORDER'}
              </button>
            )}
          </>
        )}

        {/* SUBMITTED REVIEW */}

        {review ? (
          <div className="order-review-summary">

            <div className="order-review-heading">
              <Check size={15} />

              <span>
                Your Review
              </span>
            </div>

            <div
              className="order-review-stars"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map(
                star => (
                  <Star
                    key={star}
                    size={14}
                    fill={
                      star <=
                      Number(
                        review.rating
                      )
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                )
              )}
            </div>

            {review.reviewText && (
              <div className="order-review-text">
                "{review.reviewText}"
              </div>
            )}

            {review.reviewImageUrl && (
              <img
                className="order-review-image"
                src={
                  review.reviewImageUrl
                }
                alt="Your product review"
              />
            )}

            <div className="order-review-submitted">
              <Check size={13} />
              REVIEW SUBMITTED
            </div>
          </div>
        ) : (
          onFeedback && (
            <button
              type="button"
              className="order-rate-review"
              onClick={() =>
                onFeedback(item)
              }
            >
              <Star size={17} />
              Rate & Review Product
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ORDER CARD
========================================================= */

function OrderCard({
  order,
  onFeedback,
  reviewedItems,
  onCancelItem,
  cancellingItemId
}) {
  const [
    expanded,
    setExpanded
  ] = useState(false);

  const orderStatus =
    String(
      order.orderStatus ||
        order.status ||
        'pending'
    ).toLowerCase();

  const items =
    order.items ||
    order.orderItems ||
    [];

  const orderNumber =
    order.orderNumber ||
    order.order_number ||
    order.id;

  const createdAt =
    order.createdAt ||
    order.created_at;

  const subtotal = Number(
    order.subtotal || 0
  );

  const deliveryCharge =
    Number(
      order.deliveryCharge ??
        order.delivery_charge ??
        0
    );

  const discount = Number(
    order.discount || 0
  );

  const total = Number(
    order.grandTotal ??
      order.grand_total ??
      order.total ??
      0
  );

  const estimatedDelivery =
    order.estimatedDeliveryDate ||
    order.estimated_delivery_date;

  const address = [
    order.doorNumber ||
      order.door_number,

    order.street,
    order.city,
    order.district,
    order.state,

    order.pinCode ||
      order.pin_code
  ]
    .filter(Boolean)
    .join(', ');

  const isDelivered =
    orderStatus === 'delivered';

  /*
   * CUSTOMER CAN CANCEL ONLY
   * BEFORE PROCESSING STARTS.
   */
  const canCancelOrder =
    orderStatus === 'pending' ||
    orderStatus === 'confirmed';

  return (
    <article className="order-card">

      {/* ORDER HEADER */}

      <div className="order-card-header">
        <div>
          <span className="order-small-label">
            ORDER NUMBER
          </span>

          <h2>
            #{orderNumber}
          </h2>

          <p>
            Placed on{' '}
            {createdAt
              ? new Date(
                  createdAt
                ).toLocaleDateString(
                  'en-IN'
                )
              : '-'}
          </p>
        </div>

        <div
          className={`order-status ${
            orderStatus ===
            'cancelled'
              ? 'cancelled'
              : ''
          }`}
        >
          {STATUS_LABELS[
            orderStatus
          ] ||
            orderStatus}
        </div>
      </div>

      {/* PRODUCTS */}

      <div className="ordered-products">
        {items.map(item => {
          const storedReview =
            reviewedItems[
              String(item.id)
            ];

          const review =
            storedReview &&
            typeof storedReview ===
              'object'
              ? storedReview
              : null;

          const hasReviewed =
            Boolean(
              storedReview
            );

          const itemStatus =
            String(
              item.sellerStatus ||
                item.seller_status ||
                item.status ||
                ''
            ).toLowerCase();

          const itemCancelled =
            itemStatus ===
            'cancelled';

          return (
            <ProductOrderCard
              key={
                item.id ||
                `${order.id}-${item.productId}`
              }
              item={item}
              orderCancelled={
                orderStatus === 'cancelled'
              }
              orderDelivered={
                orderStatus === 'delivered'
              }
              review={review}
              onFeedback={
                isDelivered &&
                !hasReviewed &&
                !itemCancelled
                  ? onFeedback
                  : null
              }
              canCancel={
                canCancelOrder &&
                !itemCancelled
              }
              onCancel={
                onCancelItem
              }
              cancelling={
                cancellingItemId ===
                Number(item.id)
              }
            />
          );
        })}
      </div>

      {/* TRACKING */}

      {orderStatus ===
      'cancelled' ? (
        <div className="cancelled-order-message">
          <X size={20} />

          <span>
            This order has been
            cancelled.
          </span>
        </div>
      ) : (
        <OrderProgress
          status={
            orderStatus
          }
        />
      )}

      {/* DELIVERY */}

      {estimatedDelivery && (
        <div className="estimated-delivery">
          <Truck size={18} />

          <div>
            <span>
              Estimated Delivery
            </span>

            <strong>
              {new Date(
                estimatedDelivery
              ).toLocaleDateString(
                'en-IN'
              )}
            </strong>
          </div>
        </div>
      )}

      {/* SUMMARY */}

      <div className="order-card-details">

        <div>
          <span>
            Items
          </span>

          <strong>
            {items.reduce(
              (
                totalItems,
                item
              ) =>
                totalItems +
                Number(
                  item.quantity ||
                    0
                ),
              0
            )}
          </strong>
        </div>

        <div>
          <span>
            Subtotal
          </span>

          <strong>
            {formatMoney(
              subtotal
            )}
          </strong>
        </div>

        <div>
          <span>
            Delivery
          </span>

          <strong>
            {deliveryCharge >
            0
              ? formatMoney(
                  deliveryCharge
                )
              : 'FREE'}
          </strong>
        </div>

        {discount > 0 && (
          <div>
            <span>
              Discount
            </span>

            <strong>
              -
              {formatMoney(
                discount
              )}
            </strong>
          </div>
        )}

        <div>
          <span>
            Total
          </span>

          <strong>
            {formatMoney(
              total
            )}
          </strong>
        </div>

        {/* <div>
          <span>
            Estimated Delivery
          </span>

          <strong>
            {estimatedDelivery
              ? new Date(
                  estimatedDelivery
                ).toLocaleDateString(
                  'en-IN'
                )
              : 'Updating'}
          </strong>
        </div> */}
      </div>

      {/* FOOTER */}

      <div className="order-card-footer">

        <button
          type="button"
          className="order-details-button"
          onClick={() =>
            setExpanded(
              value => !value
            )
          }
        >
          {expanded
            ? 'Hide Order Details'
            : 'View Order Details'}

          {expanded ? (
            <ChevronUp
              size={18}
            />
          ) : (
            <ChevronDown
              size={18}
            />
          )}
        </button>

        <Link
          to={`/track-order/${order.id}`}
          className="track-order-link"
        >
          TRACK ORDER
        </Link>
      </div>

      {/* EXPANDED DETAILS */}

      {expanded && (
        <div className="order-details">

          <div className="order-details-grid">

            {/* DELIVERY ADDRESS */}

            <div className="order-detail-box">

              <div className="order-detail-title">
                <MapPin size={18} />
                Delivery Address
              </div>

              <p>
                {order.customerName ||
                  order.customer_name ||
                  'Customer'}
              </p>

              <span>
                {address ||
                  'Delivery address unavailable'}
              </span>

              {(order.mobileNumber ||
                order.mobile_number) && (
                <span>
                  Phone:{' '}
                  {order.mobileNumber ||
                    order.mobile_number}
                </span>
              )}
            </div>

            {/* PAYMENT */}

            <div className="order-detail-box">

              <div className="order-detail-title">
                <Package size={18} />
                Payment
              </div>

              <p>
                {String(
                  order.paymentMethod ||
                    order.payment_method ||
                    'N/A'
                )
                  .replace(
                    /_/g,
                    ' '
                  )
                  .replace(
                    /\b\w/g,
                    char =>
                      char.toUpperCase()
                  )}
              </p>

              <span>
                Payment Status:{' '}
                {String(
                  order.paymentStatus ||
                    order.payment_status ||
                    'pending'
                )
                  .replace(
                    /_/g,
                    ' '
                  )
                  .replace(
                    /\b\w/g,
                    char =>
                      char.toUpperCase()
                  )}
              </span>
            </div>
          </div>

          {/* ORDER SUMMARY */}

          <div className="order-summary">

            <h3>
              Order Summary
            </h3>

            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                {formatMoney(
                  subtotal
                )}
              </strong>
            </div>

            <div className="summary-row">
              <span>
                Delivery
              </span>

              <strong>
                {deliveryCharge >
                0
                  ? formatMoney(
                      deliveryCharge
                    )
                  : 'FREE'}
              </strong>
            </div>

            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>
                  Discount
                </span>

                <strong>
                  -
                  {formatMoney(
                    discount
                  )}
                </strong>
              </div>
            )}

            <div className="summary-row summary-total">
              <span>
                Total
              </span>

              <strong>
                {formatMoney(
                  total
                )}
              </strong>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   ORDERS PAGE
========================================================= */

export default function Orders() {
  const { user } =
    useAuth();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [feedbackItem, setFeedbackItem] =
    useState(null);

  const [reviewedItems, setReviewedItems] =
    useState(
      getReviewedOrderItems()
    );

  /* =======================================================
     CANCEL STATE
  ======================================================= */

  const [cancellingItemId, setCancellingItemId] =
    useState(null);

  const [cancelError, setCancelError] =
    useState('');

  const userId =
    user?.id ||
    user?.email ||
    null;

  const loadingOrdersRef =
    useRef(false);

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  async function loadOrders(
    showLoading = false
  ) {
    if (!userId || loadingOrdersRef.current) {
      return;
    }

    loadingOrdersRef.current = true;

    try {
      if (showLoading) {
        setLoading(true);
      }

      setError('');

      const response =
        await api.getOrders();

      const nextOrders =
        Array.isArray(response)
          ? response
          : response?.orders ||
            [];

      setOrders(nextOrders);
    } catch (err) {
      setError(
        err?.message ||
          'Unable to load your orders.'
      );
    } finally {
      loadingOrdersRef.current = false;

      if (showLoading) {
        setLoading(false);
      }
    }
  }

  /* =======================================================
     CANCEL ORDER ITEM
  ======================================================= */

  async function handleCancelItem(item) {
    const itemId =
      Number(item?.id);

    if (!itemId) {
      return;
    }

    const productName =
      item?.productName ||
      'this product';

    const confirmed =
      window.confirm(
        `Are you sure you want to cancel "${productName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingItemId(
        itemId
      );

      setCancelError('');

      /*
       * This calls:
       *
       * PUT
       * /api/orders/items/:orderItemId/cancel
       */
      await api.cancelOrderItem(
        itemId
      );

      /*
       * Refresh immediately
       * so the new status appears.
       */
      await loadOrders(false);
    } catch (err) {
      setCancelError(
        err?.message ||
          'Unable to cancel this product. Please try again.'
      );
    } finally {
      setCancellingItemId(
        null
      );
    }
  }

  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return undefined;
    }

    let active = true;

    const load = async (showLoading = false) => {
      if (!active) {
        return;
      }

      await loadOrders(showLoading);
    };

    load(true);

    // Avoid rapid repeated /api/orders requests.
    // Refresh once every 30 seconds.
    const interval = setInterval(() => {
      load(false);
    }, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  /* =======================================================
     SORT ORDERS
  ======================================================= */

  const sortedOrders =
    useMemo(() => {
      return [
        ...orders
      ].sort(
        (a, b) => {
          const dateA =
            new Date(
              a.createdAt ||
                a.created_at ||
                0
            ).getTime();

          const dateB =
            new Date(
              b.createdAt ||
                b.created_at ||
                0
            ).getTime();

          return (
            dateB -
            dateA
          );
        }
      );
    }, [orders]);

  /* =======================================================
     FEEDBACK SUBMITTED
  ======================================================= */

  function handleFeedbackSubmitted(
    orderItemId,
    review
  ) {
    const next = {
      ...reviewedItems,

      [String(orderItemId)]: {
        rating:
          Number(
            review?.rating || 0
          ),

        reviewText:
          String(
            review?.reviewText || ''
          ),

        reviewImageUrl:
          review?.reviewImageUrl ||
          null,

        submittedAt:
          new Date().toISOString()
      }
    };

    setReviewedItems(
      next
    );

    setFeedbackItem(
      null
    );
  }

  /* =======================================================
     LOGIN REQUIRED
  ======================================================= */

  if (!user) {
    return (
      <section className="orders-page content-section">
        <div className="orders-container">
          <EmptyState
            title="Sign in to view your orders"
            message="Login to see your orders and track your deliveries."
            action="Login"
            to="/login"
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="orders-page content-section">
        <div className="orders-container">
          <Loading />
        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <section className="orders-page content-section">

      <div className="orders-container">

        {/* PAGE HEADER */}

        <div className="orders-heading">
          <div>
            <p className="eyebrow">
              DREAM KRAFT LUNGIS
            </p>

            <h1>
              My Orders
            </h1>

            <p>
              View your purchases and
              track your orders.
            </p>
          </div>

          <div className="orders-count">
            <Package size={19} />

            <span>
              {orders.length}{' '}
              {orders.length === 1
                ? 'Order'
                : 'Orders'}
            </span>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="orders-error">
            {error}
          </div>
        )}

        {/* CANCEL ERROR */}

        {cancelError && (
          <div className="orders-error">
            {cancelError}
          </div>
        )}

        {/* EMPTY */}

        {!sortedOrders.length &&
        !error ? (
          <div className="orders-empty">

            <div className="orders-empty-icon">
              <Package size={42} />
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              You haven't placed an
              order yet. Start shopping
              to see your orders here.
            </p>

            <Link
              to="/shop"
              className="btn btn-primary"
            >
              SHOP NOW
            </Link>
          </div>
        ) : (
          <div className="orders-list">

            {sortedOrders.map(
              order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  reviewedItems={
                    reviewedItems
                  }

                  onFeedback={
                    item =>
                      setFeedbackItem(
                        item
                      )
                  }

                  onCancelItem={
                    handleCancelItem
                  }

                  cancellingItemId={
                    cancellingItemId
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK POPUP */}

      {feedbackItem && (
        <FeedbackModal
          item={
            feedbackItem
          }

          onClose={() =>
            setFeedbackItem(
              null
            )
          }

          onSubmitted={
            handleFeedbackSubmitted
          }
        />
      )}
    </section>
  );
}