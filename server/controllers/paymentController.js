import * as orderRepo from '../repositories/orderRepo.js';
import * as paymentRepo from '../repositories/paymentRepo.js';
import {
  createRazorpayOrder,
  fetchPayment,
  fetchRazorpayOrderPayments,
  getPublicConfig,
  isRazorpayConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature
} from '../services/paymentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';

function getOrderId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function assertOrderAccess(order, req) {
  if (!order) return false;

  if (!order.user_id && !order.userId) {
    return true;
  }

  const userId = Number(order.user_id ?? order.userId);

  return Boolean(
    req.user?.role === 'admin' ||
    (req.user?.id && Number(req.user.id) === userId)
  );
}

export const config = asyncHandler(async (req, res) => {
  if (!isRazorpayConfigured()) {
    return fail(
      res,
      'Razorpay test credentials are not configured on the server',
      503
    );
  }

  return ok(res, getPublicConfig());
});

export const createOrder = asyncHandler(async (req, res) => {
  const orderId = getOrderId(req.body.orderId);
  const paymentSessionToken =
    typeof req.body.paymentSessionToken === 'string'
      ? req.body.paymentSessionToken.trim()
      : '';

  if (!orderId || !paymentSessionToken) {
    return fail(
      res,
      'orderId and paymentSessionToken are required',
      400
    );
  }

  const order = await paymentRepo.getOrderForPayment(
    orderId,
    paymentSessionToken
  );

  if (!order) {
    return fail(res, 'Order not found or payment session is invalid', 404);
  }

  if (!assertOrderAccess(order, req)) {
    return fail(res, 'Access denied', 403);
  }

  const paymentStatus = order.payment_status ?? order.paymentStatus;

  if (paymentStatus === 'paid') {
    return fail(res, 'This order is already paid', 409);
  }

  const existingRazorpayOrderId =
    order.razorpay_order_id ?? order.razorpayOrderId;

  if (existingRazorpayOrderId) {
    return ok(res, {
      keyId: getPublicConfig().keyId,
      currency: 'INR',
      amount: Math.round(Number(order.grand_total ?? order.grandTotal) * 100),
      razorpayOrderId: existingRazorpayOrderId,
      orderId: Number(order.id),
      orderNumber: order.order_number ?? order.orderNumber,
      testMode: getPublicConfig().testMode
    });
  }

  const razorpayOrder = await createRazorpayOrder({
    amount: Number(order.grand_total ?? order.grandTotal),
    receipt: order.order_number ?? order.orderNumber,
    notes: {
      local_order_id: String(order.id),
      order_number: String(order.order_number ?? order.orderNumber)
    }
  });

  await paymentRepo.attachRazorpayOrder(
    Number(order.id),
    razorpayOrder.id
  );

  const publicConfig = getPublicConfig();

  return ok(res, {
    keyId: publicConfig.keyId,
    currency: razorpayOrder.currency,
    amount: razorpayOrder.amount,
    razorpayOrderId: razorpayOrder.id,
    orderId: Number(order.id),
    orderNumber: order.order_number ?? order.orderNumber,
    testMode: publicConfig.testMode
  }, 201);
});

export const verify = asyncHandler(async (req, res) => {
  const orderId = getOrderId(req.body.orderId);
  const paymentSessionToken =
    typeof req.body.paymentSessionToken === 'string'
      ? req.body.paymentSessionToken.trim()
      : '';

  const razorpayOrderId =
    typeof req.body.razorpayOrderId === 'string'
      ? req.body.razorpayOrderId.trim()
      : '';

  const razorpayPaymentId =
    typeof req.body.razorpayPaymentId === 'string'
      ? req.body.razorpayPaymentId.trim()
      : '';

  const razorpaySignature =
    typeof req.body.razorpaySignature === 'string'
      ? req.body.razorpaySignature.trim()
      : '';

  if (
    !orderId ||
    !paymentSessionToken ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    return fail(res, 'All Razorpay verification fields are required', 400);
  }

  const order = await paymentRepo.getOrderForPayment(
    orderId,
    paymentSessionToken
  );

  if (!order) {
    return fail(res, 'Order not found or payment session is invalid', 404);
  }

  if (!assertOrderAccess(order, req)) {
    return fail(res, 'Access denied', 403);
  }

  const storedRazorpayOrderId =
    order.razorpay_order_id ?? order.razorpayOrderId;

  if (storedRazorpayOrderId !== razorpayOrderId) {
    return fail(res, 'Razorpay order ID does not match this order', 400);
  }

  const validSignature = verifyPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  if (!validSignature) {
    return fail(res, 'Invalid Razorpay payment signature', 400);
  }

  const payment = await fetchPayment(razorpayPaymentId);
  const expectedAmount = Math.round(
    Number(order.grand_total ?? order.grandTotal) * 100
  );

  if (Number(payment.amount) !== expectedAmount) {
    return fail(res, 'Payment amount does not match the order amount', 400);
  }

  if (payment.currency !== 'INR') {
    return fail(res, 'Payment currency does not match the order currency', 400);
  }

  if (payment.order_id !== razorpayOrderId) {
    return fail(res, 'Payment is linked to a different Razorpay order', 400);
  }

  if (payment.status !== 'captured') {
    return fail(
      res,
      `Payment is not captured. Current status: ${payment.status}`,
      409
    );
  }

  const saved = await paymentRepo.markPaymentVerified({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  return ok(res, {
    verified: true,
    paymentStatus: 'paid',
    order: paymentRepo.mapPaymentOrder(saved)
  });
});

export const webhook = asyncHandler(async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(req.body || '');

  const signature = req.headers['x-razorpay-signature'];

  if (!verifyWebhookSignature(rawBody, signature)) {
    return fail(res, 'Invalid Razorpay webhook signature', 400);
  }

  let payload;

  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return fail(res, 'Invalid webhook JSON', 400);
  }

  const eventId = req.headers['x-razorpay-event-id'] || null;
  const eventName = payload.event || '';

  const savedEvent = await paymentRepo.saveWebhookEvent({
    eventId,
    eventName,
    payload
  });

  if (!savedEvent.inserted) {
    return ok(res, { received: true, duplicate: true });
  }

  if (eventName === 'payment.captured') {
    const paymentEntity =
      payload.payload?.payment?.entity;

    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (razorpayOrderId && razorpayPaymentId) {
      const order = await paymentRepo.findByRazorpayOrderId(
        razorpayOrderId
      );

      if (order) {
        const expectedAmount = Math.round(
          Number(order.grand_total ?? order.grandTotal) * 100
        );

        if (
          Number(paymentEntity.amount) === expectedAmount &&
          paymentEntity.currency === 'INR' &&
          paymentEntity.status === 'captured'
        ) {
          await paymentRepo.markPaymentVerified({
            orderId: Number(order.id),
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature: null
          });
        }
      }
    }
  }

  if (eventName === 'order.paid') {
    const orderEntity = payload.payload?.order?.entity;
    const razorpayOrderId = orderEntity?.id;

    if (razorpayOrderId && orderEntity?.status === 'paid') {
      const order = await paymentRepo.findByRazorpayOrderId(
        razorpayOrderId
      );

      if (order) {
        const expectedAmount = Math.round(
          Number(order.grand_total ?? order.grandTotal) * 100
        );

        if (
          Number(orderEntity.amount_paid) === expectedAmount &&
          Number(orderEntity.amount_due) === 0
        ) {
          const paymentResponse =
            await fetchRazorpayOrderPayments(razorpayOrderId);
          const paymentIds = Array.isArray(paymentResponse.items)
            ? paymentResponse.items
            : [];
          const capturedPayment = paymentIds.find(
            item => item.status === 'captured'
          );

          if (capturedPayment) {
            await paymentRepo.markPaymentVerified({
              orderId: Number(order.id),
              razorpayOrderId,
              razorpayPaymentId: capturedPayment.id,
              razorpaySignature: null
            });
          }
        }
      }
    }
  }

  if (eventName === 'payment.failed') {
    const paymentEntity =
      payload.payload?.payment?.entity;

    const razorpayOrderId = paymentEntity?.order_id;
    const reason =
      paymentEntity?.error_description ||
      paymentEntity?.error_reason ||
      'Payment failed';

    if (razorpayOrderId) {
      const order = await paymentRepo.findByRazorpayOrderId(
        razorpayOrderId
      );

      if (order) {
        await paymentRepo.markPaymentFailed({
          orderId: Number(order.id),
          razorpayOrderId,
          reason
        });
      }
    }
  }

  return ok(res, { received: true });
});
