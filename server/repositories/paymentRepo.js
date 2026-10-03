import { orders } from '../data.js';
import { pool } from '../config/database.js';
import { num, usingDatabase } from './db.js';

export async function getOrderForPayment(orderId, paymentSessionToken) {
  if (!usingDatabase()) {
    const order = orders.find(
      item => Number(item.id) === Number(orderId)
    );

    if (!order) return null;

    if (
      paymentSessionToken &&
      order.paymentSessionToken !== paymentSessionToken
    ) {
      return null;
    }

    return order;
  }

  const { rows } = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1
      AND ($2::text IS NULL OR payment_session_token = $2)
    LIMIT 1
    `,
    [orderId, paymentSessionToken || null]
  );

  return rows[0] || null;
}

export async function findByRazorpayOrderId(razorpayOrderId) {
  if (!usingDatabase()) {
    return (
      orders.find(
        item => item.razorpayOrderId === razorpayOrderId
      ) || null
    );
  }

  const { rows } = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE razorpay_order_id = $1
    LIMIT 1
    `,
    [razorpayOrderId]
  );

  return rows[0] || null;
}

export async function findByRazorpayPaymentId(razorpayPaymentId) {
  if (!usingDatabase()) {
    return (
      orders.find(
        item => item.razorpayPaymentId === razorpayPaymentId
      ) || null
    );
  }

  const { rows } = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE razorpay_payment_id = $1
    LIMIT 1
    `,
    [razorpayPaymentId]
  );

  return rows[0] || null;
}

export async function attachRazorpayOrder(
  orderId,
  razorpayOrderId
) {
  if (!usingDatabase()) {
    const order = orders.find(
      item => Number(item.id) === Number(orderId)
    );

    if (!order) return null;

    order.razorpayOrderId = razorpayOrderId;
    order.paymentStatus = 'payment_pending';
    return order;
  }

  const { rows } = await pool.query(
    `
    UPDATE orders
    SET
      razorpay_order_id = $1,
      payment_status = CASE
        WHEN payment_status = 'paid' THEN payment_status
        ELSE 'payment_pending'
      END,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [razorpayOrderId, orderId]
  );

  return rows[0] || null;
}

export async function markPaymentVerified({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod = 'Online Payment'
}) {
  if (!usingDatabase()) {
    const order = orders.find(
      item => Number(item.id) === Number(orderId)
    );

    if (!order) return null;

    order.paymentMethod = paymentMethod;
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentSignature = razorpaySignature;
    order.paymentStatus = 'paid';
    order.paymentVerifiedAt = new Date().toISOString();

    if (order.orderStatus === 'pending_payment') {
      order.orderStatus = 'confirmed';
    }

    return order;
  }

  const { rows } = await pool.query(
    `
    UPDATE orders
    SET
      payment_method = $1,
      payment_status = 'paid',
      order_status = CASE
        WHEN order_status = 'pending_payment' THEN 'confirmed'
        ELSE order_status
      END,
      razorpay_order_id = $2,
      razorpay_payment_id = $3,
      payment_signature = COALESCE($4, payment_signature),
      payment_verified_at = NOW(),
      payment_failure_reason = NULL,
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
    `,
    [
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    ]
  );

  return rows[0] || null;
}

export async function markPaymentFailed({
  orderId,
  razorpayOrderId = null,
  reason = 'Payment failed'
}) {
  if (!usingDatabase()) {
    const order = orders.find(
      item => Number(item.id) === Number(orderId)
    );

    if (!order) return null;

    order.razorpayOrderId =
      razorpayOrderId || order.razorpayOrderId || null;
    order.paymentStatus = 'failed';
    order.paymentFailureReason = String(reason).slice(0, 500);

    return order;
  }

  const { rows } = await pool.query(
    `
    UPDATE orders
    SET
      payment_status = 'failed',
      razorpay_order_id = COALESCE($1, razorpay_order_id),
      payment_failure_reason = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
    `,
    [
      razorpayOrderId,
      String(reason).slice(0, 500),
      orderId
    ]
  );

  return rows[0] || null;
}

export async function saveWebhookEvent({
  eventId,
  eventName,
  payload
}) {
  if (!usingDatabase()) {
    return { inserted: true };
  }

  if (!eventId) return { inserted: true };

  const { rows } = await pool.query(
    `
    INSERT INTO payment_webhook_events
      (event_id, event_name, payload)
    VALUES
      ($1, $2, $3::jsonb)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING id
    `,
    [
      eventId,
      eventName || null,
      JSON.stringify(payload)
    ]
  );

  return {
    inserted: rows.length > 0
  };
}

export function mapPaymentOrder(row) {
  if (!row) return null;

  return {
    id: num(row.id),
    orderNumber: row.order_number,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    grandTotal: Number(row.grand_total),
    razorpayOrderId: row.razorpay_order_id || null,
    razorpayPaymentId: row.razorpay_payment_id || null,
    paymentVerifiedAt: row.payment_verified_at || null
  };
}
