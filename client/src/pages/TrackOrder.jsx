import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
  ArrowLeft,
  Receipt,
  Store,
  Phone,
  Mail,
  XCircle
} from 'lucide-react';

import {
  Link,
  useParams
} from 'react-router-dom';

import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import { formatMoney } from '../utils/money.js';

import '../styles/track-order.css';

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 49;

const steps = [
  {
    key: 'pending',
    label: 'Order Placed',
    icon: Package
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: CheckCircle
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
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: Truck
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: CheckCircle
  }
];

/* =========================================================
   STATUS HELPERS
========================================================= */

const normalizeStatus = status => {
  const value = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  if (value === 'processing') {
    return 'packed';
  }

  if (value === 'outfordelivery') {
    return 'out_for_delivery';
  }

  return value;
};

const getStatusIndex = status => {
  const normalized = normalizeStatus(status);

  const index = steps.findIndex(
    step => step.key === normalized
  );

  return index >= 0 ? index : 0;
};

const formatStatus = status => {
  const normalized = normalizeStatus(status);

  if (!normalized) {
    return 'Pending';
  }

  return normalized
    .split('_')
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
};

/* =========================================================
   ITEM HELPERS
========================================================= */

const getItemStatus = item => {
  return normalizeStatus(
    item?.sellerStatus ||
      item?.seller_status ||
      item?.status ||
      ''
  );
};

const getItemPrice = item => {
  return Number(
    item?.unitPrice ??
      item?.unit_price ??
      item?.price ??
      item?.salePrice ??
      item?.sale_price ??
      0
  );
};

const getItemQuantity = item => {
  return Number(item?.quantity || 0);
};

const getItemTotal = item => {
  const quantity = getItemQuantity(item);
  const unitPrice = getItemPrice(item);

  return Number(
    item?.totalPrice ??
      item?.total_price ??
      unitPrice * quantity
  );
};

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ item }) {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadImage = async () => {
      try {
        setLoading(true);

        let imageUrl =
          item?.imageUrl ||
          item?.image_url ||
          item?.image ||
          item?.productImage ||
          item?.product_image_url ||
          '';

        /*
         * If order item does not contain an image,
         * try loading the product from the API.
         */
        if (!imageUrl && item?.productId) {
          try {
            const product = await api.getProduct(
              item.productId
            );

            imageUrl =
              product?.images?.[0]?.imageUrl ||
              product?.images?.[0]?.image_url ||
              product?.imageUrl ||
              product?.image_url ||
              '';
          } catch (error) {
            console.warn(
              'Unable to load product image:',
              error
            );
          }
        }

        if (active) {
          setImage(imageUrl || '');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      active = false;
    };
  }, [
    item?.productId,
    item?.imageUrl,
    item?.image_url,
    item?.image,
    item?.productImage,
    item?.product_image_url
  ]);

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
        item?.productName ||
        item?.product_name ||
        'Ordered product'
      }
      loading="lazy"
      onError={event => {
        event.currentTarget.style.display = 'none';
      }}
    />
  );
}

/* =========================================================
   TRACK ORDER
========================================================= */

const TrackOrder = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] =
    useState(null);

  /* =======================================================
     LOAD ORDER
  ======================================================= */

  const loadOrder = async () => {
    try {
      const response = await api.getOrder(id);

      const data =
        response?.order ||
        response?.data ||
        response;

      setOrder(data);
      setError('');
    } catch (err) {
      console.error(
        'Failed to load order:',
        err
      );

      setError(
        err?.message ||
          'Unable to load your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD + POLL
  ======================================================= */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Invalid order ID.');
      return undefined;
    }

    loadOrder();

    const interval = setInterval(() => {
      loadOrder();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  /* =======================================================
     ITEMS
  ======================================================= */

  const items = useMemo(() => {
    return Array.isArray(order?.items)
      ? order.items
      : [];
  }, [order]);

  /* =======================================================
     ORDER STATUS
  ======================================================= */

  const currentStatus = normalizeStatus(
    order?.orderStatus ||
      order?.order_status
  );

  const isCancelled =
    currentStatus === 'cancelled';

  const currentIndex = isCancelled
    ? 0
    : getStatusIndex(
        order?.orderStatus ||
          order?.order_status
      );

  /* =======================================================
     ORDER CANCELLATION STATUS
  ======================================================= */

  const cancellableStatuses = [
    'pending',
    'confirmed',
    'processing',
    'packed'
  ];

  const canCancelOrder =
    !isCancelled &&
    cancellableStatuses.includes(
      currentStatus
    );

  /* =======================================================
     DELIVERED ITEMS
  ======================================================= */

  const hasDeliveredItems = useMemo(() => {
    if (!items.length) {
      return false;
    }

    const hasIndividualStatuses =
      items.some(
        item =>
          item?.sellerStatus ||
          item?.seller_status ||
          item?.status
      );

    if (hasIndividualStatuses) {
      return items.some(
        item =>
          getItemStatus(item) ===
          'delivered'
      );
    }

    return (
      normalizeStatus(
        order?.orderStatus ||
          order?.order_status
      ) === 'delivered'
    );
  }, [
    items,
    order?.orderStatus,
    order?.order_status
  ]);

  const deliveredItems = useMemo(() => {
    return items.filter(
      item =>
        getItemStatus(item) ===
        'delivered'
    );
  }, [items]);

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + getItemTotal(item),
      0
    );
  }, [items]);

  const deliveredSubtotal = useMemo(() => {
    return deliveredItems.reduce(
      (total, item) =>
        total + getItemTotal(item),
      0
    );
  }, [deliveredItems]);

  /* =======================================================
     DISCOUNT
  ======================================================= */

  const orderDiscount = Number(
    order?.discount || 0
  );

  const deliveredDiscount = useMemo(() => {
    if (
      !deliveredItems.length ||
      subtotal <= 0 ||
      orderDiscount <= 0
    ) {
      return 0;
    }

    return Math.min(
      deliveredSubtotal,
      (deliveredSubtotal / subtotal) *
        orderDiscount
    );
  }, [
    deliveredItems,
    deliveredSubtotal,
    subtotal,
    orderDiscount
  ]);

  /* =======================================================
     ALL ITEMS DELIVERED
  ======================================================= */

  const allItemsDelivered = useMemo(() => {
    if (!items.length) {
      return false;
    }

    return items.every(
      item =>
        getItemStatus(item) ===
        'delivered'
    );
  }, [items]);

  /* =======================================================
     INVOICE DELIVERY CHARGE
  ======================================================= */

  const invoiceDeliveryCharge = useMemo(() => {
    if (!hasDeliveredItems) {
      return 0;
    }

    /*
     * If the complete order is delivered,
     * use the original delivery charge.
     */
    if (allItemsDelivered) {
      const originalCharge = Number(
        order?.deliveryCharge ??
          order?.delivery_charge ??
          0
      );

      if (originalCharge > 0) {
        return originalCharge;
      }

      return deliveredSubtotal >=
        FREE_DELIVERY_LIMIT
        ? 0
        : DELIVERY_CHARGE;
    }

    /*
     * Partial delivery:
     * Do not add another delivery charge.
     */
    return 0;
  }, [
    hasDeliveredItems,
    allItemsDelivered,
    order?.deliveryCharge,
    order?.delivery_charge,
    deliveredSubtotal
  ]);

  /* =======================================================
     INVOICE GRAND TOTAL
  ======================================================= */

  const invoiceGrandTotal = useMemo(() => {
    if (!hasDeliveredItems) {
      return 0;
    }

    return Math.max(
      0,
      deliveredSubtotal -
        deliveredDiscount +
        invoiceDeliveryCharge
    );
  }, [
    hasDeliveredItems,
    deliveredSubtotal,
    deliveredDiscount,
    invoiceDeliveryCharge
  ]);

  /*
   * Keep calculated invoice values available for future
   * invoice UI / debugging.
   */
  void invoiceGrandTotal;

  /* =======================================================
     CANCEL PRODUCT
  ======================================================= */

  const handleCancelProduct = async item => {
    if (!item?.id) {
      return;
    }

    const itemId = item.id;

    try {
      setCancellingId(itemId);

      await api.cancelOrderItem(itemId);

      await loadOrder();
    } catch (err) {
      console.error(
        'Cancel product failed:',
        err
      );

      window.alert(
        err?.message ||
          'Unable to cancel this product. Please try again.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <Loading />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !order) {
    return (
      <div className="track-order-page">
        <div className="track-order-container">
          <EmptyState
            title="Unable to Load Order"
            message={error}
          />

          <div className="track-back-wrapper">
            <Link
              to="/orders"
              className="back-orders"
            >
              <ArrowLeft size={18} />
              BACK TO ORDERS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ORDER NOT FOUND
  ======================================================= */

  if (!order) {
    return (
      <div className="track-order-page">
        <div className="track-order-container">
          <EmptyState
            title="Order Not Found"
            message="We couldn't find this order."
          />

          <div className="track-back-wrapper">
            <Link
              to="/orders"
              className="back-orders"
            >
              <ArrowLeft size={18} />
              BACK TO ORDERS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="track-order-page">
      <div className="track-order-container">

        {/* BACK TO ORDERS */}

        <Link
          to="/orders"
          className="back-orders"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>

        {/* HEADER */}

        <div className="track-header">
          <div>
            <span
              style={{
                display: 'block',
                marginBottom: '7px',
                color: '#a07545',
                fontSize: '0.68rem',
                fontWeight: 900,
                letterSpacing: '0.15em'
              }}
            >
              ORDER TRACKING
            </span>

            <h1>
              Track Your Order
            </h1>

            <p>
              Order #
              <strong>
                {order.orderNumber ||
                  order.order_number ||
                  order.id}
              </strong>
            </p>
          </div>

          <div
            className={`track-status-badge ${
              isCancelled
                ? 'cancelled'
                : ''
            }`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            {isCancelled ? (
              <XCircle size={18} />
            ) : (
              <Package size={18} />
            )}

            <span>
              {isCancelled
                ? 'Cancelled'
                : formatStatus(
                    order.orderStatus ||
                      order.order_status
                  )}
            </span>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 15px',
              borderRadius: '10px',
              background: '#fff5f5',
              border: '1px solid #edc4c4',
              color: '#a8141b',
              fontSize: '14px'
            }}
          >
            {error}
          </div>
        )}

        {/* CANCELLED ORDER */}

        {isCancelled ? (
          <div className="tracking-card tracking-cancelled-card">

            <div className="tracking-card-title">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <XCircle size={28} />

                <div>
                  <span>
                    ORDER STATUS
                  </span>

                  <h2>
                    Order Cancelled
                  </h2>
                </div>
              </div>
            </div>

          
          </div>
        ) : (
          /* TRACKING TIMELINE */

          <div className="tracking-card">
            <div className="tracking-card-title">
              <div>
                <span>
                  ORDER STATUS
                </span>

                <h2>
                  {formatStatus(
                    order.orderStatus ||
                      order.order_status
                  )}
                </h2>
              </div>
            </div>

            <div className="tracking-timeline">
              {steps.map(
                (step, index) => {
                  const Icon = step.icon;

                  const completed =
                    index <= currentIndex;

                  const active =
                    index === currentIndex;

                  return (
                    <div
                      key={step.key}
                      className={`tracking-step ${
                        completed
                          ? 'completed'
                          : ''
                      } ${
                        active
                          ? 'current'
                          : ''
                      }`}
                    >
                      <div className="timeline-icon">
                        <Icon size={19} />
                      </div>

                      <div className="timeline-content">
                        <h3>
                          {step.label}
                        </h3>

                        {active && (
                          <span className="current-status">
                            CURRENT STATUS
                          </span>
                        )}
                      </div>

                      {index <
                        steps.length - 1 && (
                        <div
                          className={`timeline-line ${
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
          </div>
        )}

        {/* ESTIMATED DELIVERY */}

        {(order.estimatedDeliveryDate ||
          order.estimated_delivery_date) && (
          <div
            className="delivery-row"
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              border: '1px solid #e7dcd0',
              borderRadius: '14px',
              background: '#fff'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={20} />
              ESTIMATED DELIVERY
            </span>

            <strong>
              {new Date(
                order.estimatedDeliveryDate ||
                  order.estimated_delivery_date
              ).toLocaleDateString(
                'en-IN',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }
              )}
            </strong>
          </div>
        )}

        {/* ORDERED PRODUCTS */}

        <div className="tracking-products">
          <div className="tracking-products-heading">
            <div>
              <span
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#a07545',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  letterSpacing: '0.15em'
                }}
              >
                ORDER DETAILS
              </span>

              <h2>
                Ordered Products
              </h2>
            </div>
          </div>

          <div className="tracking-product-list">
            {items.length === 0 ? (
              <EmptyState
                title="No Products"
                message="No products were found in this order."
              />
            ) : (
              items.map(item => {
                const itemStatus =
                  getItemStatus(item);

                const itemCancelled =
                  itemStatus ===
                  'cancelled';

                const itemDelivered =
                  itemStatus ===
                  'delivered';

                const canCancelItem =
                  canCancelOrder &&
                  !itemCancelled &&
                  !itemDelivered &&
                  !cancellingId;

                const productName =
                  item.productName ||
                  item.product_name ||
                  item.name ||
                  'Product';

                const quantity =
                  getItemQuantity(item);

                const unitPrice =
                  getItemPrice(item);

                const totalPrice =
                  getItemTotal(item);

                return (
                  <div
                    className={`tracking-product ${
                      itemCancelled
                        ? 'product-cancelled'
                        : ''
                    }`}
                    key={
                      item.id ||
                      `${item.productId}-${item.variantId}`
                    }
                  >

                    {/* PRODUCT IMAGE */}

                    <ProductImage item={item} />

                    {/* PRODUCT DETAILS */}

                    <div
                      className="tracking-product-details"
                      style={{
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      <Link
                        to={
                          item.productSlug
                            ? `/products/${item.productSlug}`
                            : '#'
                        }
                        className="tracking-product-name"
                        style={{
                          textDecoration:
                            'none',
                          color: '#3a2417',
                          fontWeight: 800,
                          fontSize:
                            '1rem'
                        }}
                        onClick={event => {
                          if (
                            !item.productSlug
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        {productName}
                      </Link>

                      {item.colour && (
                        <p>
                          <strong>
                            Colour:
                          </strong>{' '}
                          {item.colour}
                        </p>
                      )}

                      {(item.sizeOrLength ||
                        item.size_or_length) && (
                        <p>
                          <strong>
                            Size / Length:
                          </strong>{' '}
                          {item.sizeOrLength ||
                            item.size_or_length}
                        </p>
                      )}

                      <p>
                        <strong>
                          Quantity:
                        </strong>{' '}
                        {quantity}
                      </p>

                      {/* SELLER */}

                      {item.seller && (
                        <div className="tracking-seller">
                          <div className="tracking-seller-heading">
                            <Store size={15} />

                            <h4>
                              {item
                                .seller
                                .storeName ||
                                item
                                  .seller
                                  .name ||
                                'Seller'}
                            </h4>
                          </div>

                          <div className="tracking-seller-content">
                            {item
                              .seller
                              .phone && (
                              <p>
                                <Phone
                                  size={13}
                                />

                                <span>
                                  {
                                    item
                                      .seller
                                      .phone
                                  }
                                </span>
                              </p>
                            )}

                            {item
                              .seller
                              .email && (
                              <p>
                                <Mail
                                  size={13}
                                />

                                <span>
                                  {
                                    item
                                      .seller
                                      .email
                                  }
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ITEM STATUS */}

                      <div
                        style={{
                          display:
                            'inline-flex',
                          alignItems:
                            'center',
                          gap: '6px',
                          marginTop:
                            '10px',
                          padding:
                            '6px 10px',
                          borderRadius:
                            '999px',
                          background:
                            itemCancelled
                              ? '#fbe8e8'
                              : itemDelivered
                              ? '#edf9f1'
                              : '#f4e8dc',
                          color:
                            itemCancelled
                              ? '#a8141b'
                              : itemDelivered
                              ? '#176b38'
                              : '#7b4a27',
                          fontSize:
                            '11px',
                          fontWeight: 800
                        }}
                      >
                        {itemCancelled ? (
                          <XCircle
                            size={15}
                          />
                        ) : itemDelivered ? (
                          <CheckCircle
                            size={15}
                          />
                        ) : (
                          <Clock
                            size={15}
                          />
                        )}

                        <span>
                          {itemCancelled
                            ? 'Cancelled'
                            : itemDelivered
                            ? 'Delivered'
                            : formatStatus(
                                itemStatus ||
                                  order.orderStatus ||
                                  order.order_status
                              )}
                        </span>
                      </div>

                      {/* CANCEL PRODUCT */}

                      {canCancelItem && (
                        <button
                          type="button"
                          className="cancel-product-button"
                          disabled={
                            cancellingId ===
                            item.id
                          }
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                `Are you sure you want to cancel "${productName}"?`
                              );

                            if (
                              confirmed
                            ) {
                              handleCancelProduct(
                                item
                              );
                            }
                          }}
                        >
                          <XCircle
                            size={16}
                          />

                          {cancellingId ===
                          item.id
                            ? 'CANCELLING...'
                            : 'CANCEL PRODUCT'}
                        </button>
                      )}

                      {itemCancelled && (
                        <span className="cancelled-product-label">
                          PRODUCT CANCELLED
                        </span>
                      )}
                    </div>

                    {/* PRICE */}

                    <div
                      className="tracking-product-price"
                      style={{
                        display: 'flex',
                        flexDirection:
                          'column',
                        alignItems:
                          'flex-end',
                        gap: '5px',
                        minWidth:
                          '75px'
                      }}
                    >
                      <span>
                        {formatMoney(
                          unitPrice
                        )}
                      </span>

                      <strong>
                        {formatMoney(
                          totalPrice
                        )}
                      </strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DELIVERY ADDRESS + PAYMENT */}

        <div className="tracking-grid">

          {/* DELIVERY ADDRESS */}

          <div className="tracking-info-card">
            <div className="tracking-info-heading">
              <MapPin size={21} />

              <div>
                <span
                  style={{
                    display: 'block',
                    marginBottom:
                      '5px',
                    color: '#a07545',
                    fontSize:
                      '0.68rem',
                    fontWeight: 900,
                    letterSpacing:
                      '0.15em'
                  }}
                >
                  DELIVERY ADDRESS
                </span>

                <h2>
                  {order.customerName ||
                    order.customer_name ||
                    'Customer'}
                </h2>
              </div>
            </div>

            <p>
              {order.doorNumber && (
                <>
                  {order.doorNumber}
                  <br />
                </>
              )}

              {order.street && (
                <>
                  {order.street}
                  <br />
                </>
              )}

              {order.city && (
                <>
                  {order.city}
                  <br />
                </>
              )}

              {order.district && (
                <>
                  {order.district}
                  <br />
                </>
              )}

              {order.state && (
                <>
                  {order.state}
                  <br />
                </>
              )}

              {order.pinCode ||
                order.pin_code}
            </p>

            {(order.mobileNumber ||
              order.mobile_number) && (
              <p>
                <strong>
                  Mobile:
                </strong>{' '}
                {order.mobileNumber ||
                  order.mobile_number}
              </p>
            )}
          </div>

          {/* PAYMENT */}

          <div className="tracking-info-card">
            <div className="tracking-info-heading">
              <Receipt size={21} />

              <div>
                <span
                  style={{
                    display: 'block',
                    marginBottom:
                      '5px',
                    color: '#a07545',
                    fontSize:
                      '0.68rem',
                    fontWeight: 900,
                    letterSpacing:
                      '0.15em'
                  }}
                >
                  PAYMENT
                </span>

                <h2>
                  {String(
                    order.paymentMethod ||
                      order.payment_method ||
                      'Cash on Delivery'
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
                </h2>
              </div>
            </div>

            <p>
              Payment Status:{' '}
              <strong>
                {String(
                  order.paymentStatus ||
                    order.payment_status ||
                    'Pending'
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
              </strong>
            </p>
          </div>
        </div>

        {/* BILL SUMMARY */}

        <div className="tracking-bill">
          <div className="tracking-bill-heading">
            <Receipt size={20} />

            <div>
              <span
                style={{
                  display: 'block',
                  marginBottom:
                    '4px',
                  color: '#a07545',
                  fontSize:
                    '0.68rem',
                  fontWeight: 900,
                  letterSpacing:
                    '0.15em'
                }}
              >
                ORDER SUMMARY
              </span>

              <h2>
                Bill Details
              </h2>
            </div>
          </div>

          <div className="bill-row">
            <span>
              Subtotal
            </span>

            <strong>
              {formatMoney(
                Number(
                  order.subtotal ??
                    subtotal
                )
              )}
            </strong>
          </div>

          <div className="bill-row">
            <span>
              Delivery Charge
            </span>

            <strong
              className={
                Number(
                  order.deliveryCharge ??
                    order.delivery_charge ??
                    0
                ) === 0
                  ? 'free-delivery'
                  : ''
              }
            >
              {Number(
                order.deliveryCharge ??
                  order.delivery_charge ??
                  0
              ) === 0
                ? 'FREE'
                : formatMoney(
                    Number(
                      order.deliveryCharge ??
                        order.delivery_charge ??
                        0
                    )
                  )}
            </strong>
          </div>

          {Number(
            order.discount || 0
          ) > 0 && (
            <div className="bill-row">
              <span>
                Discount
              </span>

              <strong className="discount-value">
                -
                {formatMoney(
                  Number(
                    order.discount
                  )
                )}
              </strong>
            </div>
          )}

          <div className="bill-divider" />

          <div className="bill-total">
            <span>
              Grand Total
            </span>

            <strong>
              {formatMoney(
                Number(
                  order.grandTotal ??
                    order.grand_total ??
                    0
                )
              )}
            </strong>
          </div>
        </div>

        {/* =================================================
            INVOICE
            ONLY VISIBLE AFTER AT LEAST ONE PRODUCT
            IS DELIVERED
        ================================================= */}

        {hasDeliveredItems && (
          <div className="track-invoice-section">
            <div className="track-invoice-content">

              <div>
                <span className="track-invoice-label">
                  ORDER DOCUMENT
                </span>

                <h3>
                  View your invoice
                </h3>

                <p>
                  Invoice is available
                  for delivered
                  products only.
                </p>
              </div>

              <Link
                to={`/invoice/${order.id}`}
                className="track-invoice-button"
              >
                <Receipt size={18} />
                VIEW INVOICE
              </Link>
            </div>
          </div>
        )}

        {/* DELIVERED NOTICE */}

        {hasDeliveredItems && (
          <div
            style={{
              display: 'flex',
              alignItems:
                'flex-start',
              gap: '12px',
              marginTop:
                '18px',
              padding:
                '15px 18px',
              borderRadius:
                '12px',
              background:
                '#edf9f1',
              border:
                '1px solid #c9e8d2',
              color:
                '#176b38'
            }}
          >
            <CheckCircle
              size={20}
            />

            <div>
              <strong>
                Delivered Products
              </strong>

              <p
                style={{
                  margin:
                    '5px 0 0',
                  fontSize:
                    '13px'
                }}
              >
                Your invoice is
                available because
                one or more
                products from
                this order have
                been delivered.
              </p>
            </div>
          </div>
        )}

        {/* BOTTOM ACTIONS */}

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap: '15px',
            marginTop:
              '28px',
            flexWrap: 'wrap'
          }}
        >
          <Link
            to="/orders"
            style={{
              minHeight: '44px',
              padding:
                '0 18px',
              border:
                '1px solid #e2d5c7',
              borderRadius:
                '8px',
              background:
                '#fff',
              color:
                '#704622',
              textDecoration:
                'none',
              display:
                'inline-flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              gap: '7px',
              fontSize:
                '11px',
              fontWeight: 800,
              letterSpacing:
                '0.05em'
            }}
          >
            <ArrowLeft
              size={17}
            />
            MY ORDERS
          </Link>

          <Link
            to="/shop"
            style={{
              minHeight: '44px',
              padding:
                '0 20px',
              borderRadius:
                '8px',
              background:
                '#7d1f1f',
              color:
                '#fff',
              textDecoration:
                'none',
              display:
                'inline-flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              fontSize:
                '11px',
              fontWeight: 800,
              letterSpacing:
                '0.05em'
            }}
          >
            CONTINUE SHOPPING
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;