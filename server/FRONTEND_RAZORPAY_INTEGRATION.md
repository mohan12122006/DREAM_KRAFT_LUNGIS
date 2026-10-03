# Frontend Razorpay integration for DREAM KRAFT LUNGIS

The backend is ready, but the React checkout must call these endpoints.

## Install browser checkout loader

From `client/`:

```bash
npm install @razorpay/razorpay-js
```

## Required checkout sequence

After your existing `POST /api/orders` succeeds, use the returned order object. For an online payment order, it contains `id` and `paymentSessionToken`.

1. Call:

```http
POST /api/payments/create-order
```

Body:

```js
{
  orderId: savedOrder.id,
  paymentSessionToken: savedOrder.paymentSessionToken
}
```

2. Use the response to open Razorpay:

```js
import RazorpayCheckout from '@razorpay/razorpay-js/checkout';

const payment = await api.createPaymentOrder({
  orderId: savedOrder.id,
  paymentSessionToken: savedOrder.paymentSessionToken
});

const checkout = await RazorpayCheckout({
  key: payment.keyId,
  amount: payment.amount,
  currency: payment.currency,
  order_id: payment.razorpayOrderId,
  name: 'DREAM KRAFT LUNGIS',
  description: `Order ${payment.orderNumber}`,
  handler: async response => {
    await api.verifyPayment({
      orderId: savedOrder.id,
      paymentSessionToken: savedOrder.paymentSessionToken,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    });

    // Only after verify succeeds:
    // navigate(`/confirmation/${savedOrder.id}`)
  }
});

checkout.on('payment.failed', async response => {
  console.error('Razorpay payment failed', response.error);
  // Show a retry message. Do not mark the order paid in React.
});

checkout.open();
```

## Add these methods to client/src/services/api.js

```js
createPaymentOrder: payload =>
  request('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

verifyPayment: payload =>
  request('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
```

Do not put the Razorpay secret in React/Vite. Only the public `keyId` is sent to the browser.
