import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';
import '../styles/invoice.css';
import html2pdf from 'html2pdf.js';

function safeText(value, fallback = '—') {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return fallback;
  }

  return String(value);
}

function getSellerKey(item) {
  if (item?.seller?.id) {
    return `seller-${item.seller.id}`;
  }

  if (item?.sellerId) {
    return `seller-${item.sellerId}`;
  }

  return 'seller-unknown';
}

function getSellerName(seller) {
  return (
    seller?.storeName ||
    seller?.name ||
    'Seller'
  );
}

function getSellerLocation(seller) {
  const parts = [
    seller?.address,
    seller?.city,
    seller?.district,
    seller?.state,
    seller?.pinCode
  ].filter(
    value =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
  );

  return parts.join(', ');
}

export default function Invoice() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =====================================================
  // LOAD ORDER
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError('');

        const data = await api.getOrder(id);

        if (!mounted) return;

        setOrder(data);
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.message ||
            'Unable to load invoice.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadOrder();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // =====================================================
  // PRINT
  // =====================================================

  const printInvoice = () => {
    window.print();
  };

  // =====================================================
  // DOWNLOAD
  // =====================================================

 const downloadInvoice = async () => {
  const invoiceElement =
    document.querySelector('.invoice-container');

  if (!invoiceElement) {
    return;
  }

  const orderNumber =
    normalizedOrder?.orderNumber ||
    `DKL-${normalizedOrder?.id || 'invoice'}`;

  const options = {
    margin: 8,

    filename: `${orderNumber}.pdf`,

    image: {
      type: 'jpeg',
      quality: 0.98
    },

    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    },

    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },

    pagebreak: {
      mode: [
        'css',
        'legacy'
      ]
    }
  };

  try {
    await html2pdf()
      .set(options)
      .from(invoiceElement)
      .save();
  } catch (error) {
    console.error(
      'Invoice download failed:',
      error
    );

    alert(
      'Unable to download invoice. Please try again.'
    );
  }
};
  // =====================================================
  // NORMALIZE ORDER DATA
  // =====================================================

  const normalizedOrder = useMemo(() => {
    if (!order) {
      return null;
    }

    const items = Array.isArray(order.items)
      ? order.items
      : [];

    return {
      id: order.id,

      orderNumber:
        order.orderNumber ||
        order.order_number ||
        `DKL-${order.id}`,

      createdAt:
        order.createdAt ||
        order.created_at,

      customerName:
        order.customerName ||
        order.customer_name ||
        '',

      email:
        order.email ||
        '',

      phone:
        order.mobileNumber ||
        order.mobile_number ||
        order.phone ||
        '',

      address: {
        doorNumber:
          order.doorNumber ||
          order.door_number ||
          '',

        street:
          order.street ||
          '',

        city:
          order.city ||
          '',

        district:
          order.district ||
          '',

        state:
          order.state ||
          '',

        pinCode:
          order.pinCode ||
          order.pin_code ||
          ''
      },

      items,

      subtotal:
        Number(
          order.subtotal || 0
        ),

      deliveryCharge:
        Number(
          order.deliveryCharge ||
            order.delivery_charge ||
            0
        ),

      discount:
        Number(
          order.discount || 0
        ),

      grandTotal:
        Number(
          order.grandTotal ||
            order.grand_total ||
            0
        ),

      paymentMethod:
        order.paymentMethod ||
        order.payment_method ||
        '',

      paymentStatus:
        order.paymentStatus ||
        order.payment_status ||
        '',

      orderStatus:
        order.orderStatus ||
        order.order_status ||
        '',

      estimatedDelivery:
        order.estimatedDeliveryDate ||
        order.estimated_delivery_date ||
        ''
    };
  }, [order]);

  // =====================================================
  // DELIVERED ITEMS ONLY
  // =====================================================

  const deliveredItems = useMemo(() => {
    if (!normalizedOrder) return [];

    const items = Array.isArray(normalizedOrder.items)
      ? normalizedOrder.items
      : [];

    return items.filter(item => {
      const itemStatus = String(
        item?.sellerStatus ||
        item?.seller_status ||
        item?.status ||
        ''
      ).toLowerCase();

      const orderStatus = String(
        normalizedOrder.orderStatus || ''
      ).toLowerCase();

      return itemStatus
        ? itemStatus === 'delivered'
        : orderStatus === 'delivered';
    });
  }, [normalizedOrder]);

  // =====================================================
  // INVOICE TOTALS FOR DELIVERED ITEMS ONLY
  // =====================================================

  const invoiceTotals = useMemo(() => {
    if (!normalizedOrder) {
      return {
        subtotal: 0,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 0
      };
    }

    const subtotal = deliveredItems.reduce(
      (sum, item) =>
        sum + Number(item?.totalPrice || item?.total_price || 0),
      0
    );

    const fullSubtotal = Number(normalizedOrder.subtotal || 0);
    const originalDiscount = Number(normalizedOrder.discount || 0);

    const discount = fullSubtotal > 0
      ? Math.min(
          originalDiscount,
          subtotal * (originalDiscount / fullSubtotal)
        )
      : 0;

    const allItemsDelivered =
      normalizedOrder.items.length > 0 &&
      deliveredItems.length === normalizedOrder.items.length;

    const deliveryCharge = allItemsDelivered
      ? Number(normalizedOrder.deliveryCharge || 0)
      : 0;

    return {
      subtotal,
      deliveryCharge,
      discount,
      grandTotal: Math.max(0, subtotal + deliveryCharge - discount)
    };
  }, [normalizedOrder, deliveredItems]);

  // =====================================================
  // GROUP DELIVERED ITEMS BY SELLER
  // =====================================================

  const sellerGroups = useMemo(() => {
    if (!normalizedOrder) {
      return [];
    }

    const groups = new Map();

    deliveredItems.forEach(item => {
      const key = getSellerKey(item);

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          seller: item.seller || null,
          items: []
        });
      }

      groups
        .get(key)
        .items
        .push(item);
    });

    return Array.from(
      groups.values()
    );
  }, [normalizedOrder]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="invoice-page">
        <div className="invoice-loading">
          <Package size={30} />
          <p>Loading invoice...</p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !normalizedOrder) {
    return (
      <main className="invoice-page">
        <div className="invoice-error">
          <h2>Invoice Not Available</h2>

          <p>
            {error ||
              'The requested order could not be found.'}
          </p>

          <Link
            to="/orders"
            className="invoice-back-button"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const addressParts = [
    normalizedOrder.address.doorNumber,
    normalizedOrder.address.street,
    normalizedOrder.address.city,
    normalizedOrder.address.district,
    normalizedOrder.address.state,
    normalizedOrder.address.pinCode
  ].filter(Boolean);

  const formattedAddress =
    addressParts.join(', ');

  // =====================================================
  // DATE
  // =====================================================

  const formattedDate =
    normalizedOrder.createdAt
      ? new Date(
          normalizedOrder.createdAt
        ).toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        )
      : '—';

  const formattedDelivery =
    normalizedOrder.estimatedDelivery
      ? new Date(
          normalizedOrder.estimatedDelivery
        ).toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        )
      : '—';

  return (
    <main className="invoice-page">
      {/* =================================================
          TOP ACTION BAR
      ================================================= */}

      <div className="invoice-actions no-print">
        <Link
          to={`/orders/${normalizedOrder.id}`}
          className="invoice-action secondary"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="invoice-action-group">
          <button
            type="button"
            className="invoice-action secondary"
            onClick={downloadInvoice}
          >
            <Download size={17} />
            Download
          </button>

          <button
            type="button"
            className="invoice-action primary"
            onClick={printInvoice}
          >
            <Printer size={17} />
            Print Invoice
          </button>
        </div>
      </div>

      {/* =================================================
          INVOICE CONTAINER
      ================================================= */}

      <section className="invoice-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-logo">
              DK
            </div>

            <div>
              <h1>
                DREAM KRAFT LUNGIS
              </h1>

              <p>
                Comfort Woven in Tradition
              </p>
            </div>
          </div>

          <div className="invoice-title">
            <span>INVOICE</span>

            <strong>
              #{safeText(
                normalizedOrder.orderNumber
              )}
            </strong>

            <small>
              Date: {formattedDate}
            </small>
          </div>
        </header>

        {/* =================================================
            STATUS
        ================================================= */}

        <section className="invoice-status">
          <div>
            <span>
              ORDER STATUS
            </span>

            <strong>
              {safeText(
                normalizedOrder.orderStatus
              ).toUpperCase()}
            </strong>
          </div>

          <div>
            <span>
              PAYMENT
            </span>

            <strong>
              {safeText(
                normalizedOrder.paymentStatus
              ).toUpperCase()}
            </strong>
          </div>

          <div>
            <span>
              PAYMENT METHOD
            </span>

            <strong>
              {safeText(
                normalizedOrder.paymentMethod
              ).toUpperCase()}
            </strong>
          </div>

          <div>
            <span>
              ESTIMATED DELIVERY
            </span>

            <strong>
              {formattedDelivery}
            </strong>
          </div>
        </section>

        {/* =================================================
            CUSTOMER + DELIVERY
        ================================================= */}

        <section className="invoice-info-grid">
          <div className="invoice-info-card">
            <div className="invoice-section-heading">
              <Package size={18} />
              <h2>
                Customer Details
              </h2>
            </div>

            <p className="invoice-customer-name">
              {safeText(
                normalizedOrder.customerName
              )}
            </p>

            {normalizedOrder.phone && (
              <p>
                <Phone size={15} />
                {normalizedOrder.phone}
              </p>
            )}

            {normalizedOrder.email && (
              <p>
                <Mail size={15} />
                {normalizedOrder.email}
              </p>
            )}
          </div>

          <div className="invoice-info-card">
            <div className="invoice-section-heading">
              <MapPin size={18} />
              <h2>
                Delivery Address
              </h2>
            </div>

            <p>
              {safeText(
                formattedAddress
              )}
            </p>
          </div>
        </section>

        {/* =================================================
            ORDER ITEMS
        ================================================= */}

        <section className="invoice-products">
          <div className="invoice-section-heading">
            <Package size={18} />

            <h2>
              Delivered Items
            </h2>
          </div>

          {/* ===============================================
              SELLER GROUPS
          =============================================== */}

          {sellerGroups.map(
            group => {
              const seller =
                group.seller;

              const sellerLocation =
                getSellerLocation(
                  seller
                );

              return (
                <div
                  className="invoice-seller-group"
                  key={group.key}
                >
                  {/* =====================================
                      SELLER DETAILS
                  ===================================== */}

                  <div className="invoice-seller-card">
                    <div className="invoice-seller-heading">
                      <span>
                        SELLER
                      </span>

                      <strong>
                        {getSellerName(
                          seller
                        )}
                      </strong>
                    </div>

                    <div className="invoice-seller-details">
                      

                      {seller?.phone && (
                        <div>
                          <Phone
                            size={14}
                          />
                          {seller.phone}
                        </div>
                      )}

                      {seller?.email && (
                        <div>
                          <Mail
                            size={14}
                          />
                          {seller.email}
                        </div>
                      )}

                      {sellerLocation && (
                        <div>
                          <MapPin
                            size={14}
                          />
                          {sellerLocation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =====================================
                      SELLER PRODUCTS
                  ===================================== */}

                  <div className="invoice-table-wrapper">
                    <table className="invoice-table">
                      <thead>
                        <tr>
                          <th>
                            Product
                          </th>

                          <th>
                            Colour
                          </th>

                          <th>
                            Size / Length
                          </th>

                          <th>
                            Qty
                          </th>

                          <th>
                            Unit Price
                          </th>

                          <th>
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {group.items.map(
                          item => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                <strong>
                                  {safeText(
                                    item.productName
                                  )}
                                </strong>
                              </td>

                              <td>
                                {safeText(
                                  item.colour
                                )}
                              </td>

                              <td>
                                {safeText(
                                  item.sizeOrLength
                                )}
                              </td>

                              <td>
                                {Number(
                                  item.quantity ||
                                    0
                                )}
                              </td>

                              <td>
                                {formatMoney(
                                  Number(
                                    item.unitPrice ||
                                      0
                                  )
                                )}
                              </td>

                              <td>
                                <strong>
                                  {formatMoney(
                                    Number(
                                      item.totalPrice ||
                                        0
                                    )
                                  )}
                                </strong>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
          )}

          {/* ===============================================
              FALLBACK FOR ORDERS WITHOUT SELLER
          =============================================== */}

          {sellerGroups.length === 0 &&
            deliveredItems.length > 0 && (
              <div className="invoice-table-wrapper">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        Colour
                      </th>

                      <th>
                        Size / Length
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Unit Price
                      </th>

                      <th>
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {deliveredItems.map(
                      item => (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            {safeText(
                              item.productName
                            )}
                          </td>

                          <td>
                            {safeText(
                              item.colour
                            )}
                          </td>

                          <td>
                            {safeText(
                              item.sizeOrLength
                            )}
                          </td>

                          <td>
                            {Number(
                              item.quantity ||
                                0
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              Number(
                                item.unitPrice ||
                                  0
                              )
                            )}
                          </td>

                          <td>
                            {formatMoney(
                              Number(
                                item.totalPrice ||
                                  0
                              )
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          {deliveredItems.length === 0 && (
            <div className="invoice-empty">
              <Package size={28} />
              <p>No delivered items are available for this invoice yet.</p>
            </div>
          )}
        </section>

        {/* =================================================
            TOTALS
        ================================================= */}

        <section className="invoice-total-section">
          <div className="invoice-total-box">
            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {formatMoney(
                  invoiceTotals.subtotal
                )}
              </strong>
            </div>

            <div>
              <span>
                Delivery Charge
              </span>

              <strong>
                {invoiceTotals.deliveryCharge > 0
                  ? formatMoney(invoiceTotals.deliveryCharge)
                  : 'FREE'}
              </strong>
            </div>

            {invoiceTotals.discount > 0 && (
              <div>
                <span>
                  Discount
                </span>

                <strong className="invoice-discount">
                  -
                  {formatMoney(
                    invoiceTotals.discount
                  )}
                </strong>
              </div>
            )}

            <div className="invoice-grand-total">
              <span>
                Grand Total
              </span>

              <strong>
                {formatMoney(
                  invoiceTotals.grandTotal
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="invoice-footer">
          <div>
            <strong>
              DREAM KRAFT LUNGIS
            </strong>

            <p>
              Comfort Woven in Tradition
            </p>
          </div>

          <div>
            <p>
              Thank you for shopping
              with us!
            </p>

            <small>
              This is a computer-generated
              invoice.
            </small>
          </div>
        </footer>
      </section>
    </main>
  );
}