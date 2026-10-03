# DREAM KRAFT LUNGIS — Razorpay Test Mode

This server now supports:

- Razorpay TEST mode order creation
- Server-side payment signature verification
- Server-side amount/currency/order checks
- `payment.captured`, `payment.failed`, and `order.paid` webhook handling
- Webhook HMAC verification
- Webhook event idempotency
- PostgreSQL payment IDs and verification timestamps
- A per-order payment session token

## 1. Install dependency

From `server/`:

```bash
npm install
```

The server uses the official Razorpay Node SDK `razorpay@2.9.8`.

## 2. Run the SQL migration

Open PostgreSQL/pgAdmin and run:

```text
migrations/001_razorpay_payment.sql
```

## 3. Configure TEST credentials

Copy `.env.example` values into `.env` and set:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Never put `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in React/Vite code.

## 4. Start the server

```bash
npm run dev
```

The API remains:

```text
http://127.0.0.1:5000/api
```

## 5. Payment endpoints

### Public Razorpay config

```http
GET /api/payments/config
```

Returns only the public key ID and test-mode flag.

### Create Razorpay order

```http
POST /api/payments/create-order
Content-Type: application/json
```

Body:

```json
{
  "orderId": 123,
  "paymentSessionToken": "token-returned-by-create-order"
}
```

The server gets the amount from PostgreSQL. The client cannot choose the payment amount.

### Verify payment

```http
POST /api/payments/verify
Content-Type: application/json
```

Body:

```json
{
  "orderId": 123,
  "paymentSessionToken": "token-returned-by-create-order",
  "razorpayOrderId": "order_xxxxxxxxx",
  "razorpayPaymentId": "pay_xxxxxxxxx",
  "razorpaySignature": "signature_from_razorpay"
}
```

The server verifies the signature and then fetches the Razorpay payment before marking the order as `paid`.

## 6. Webhook

Endpoint:

```text
POST /api/payments/webhook
```

Configure this URL in Razorpay Dashboard after the server is reachable from the internet.

Recommended events for this implementation:

- `payment.captured`
- `payment.failed`
- `order.paid`

Set the same webhook secret in:

```env
RAZORPAY_WEBHOOK_SECRET=...
```

## 7. Frontend sequence

For Online Payment:

```text
Checkout
  ↓
POST /api/orders
  ↓
Receive orderId + paymentSessionToken
  ↓
POST /api/payments/create-order
  ↓
Open Razorpay Checkout using returned keyId + razorpayOrderId
  ↓
Razorpay returns payment_id/order_id/signature
  ↓
POST /api/payments/verify
  ↓
Backend verifies
  ↓
payment_status = paid
  ↓
Go to order confirmation
```

For COD, keep the existing order flow; Razorpay is not used.

## 8. Important local-webhook limitation

Razorpay cannot normally call a private `127.0.0.1` webhook URL from the internet. For local webhook testing, expose the development server through a secure HTTPS tunnel or use a deployed test server, then configure that HTTPS URL in the Razorpay dashboard.

## 9. Database verification

After a successful test payment:

```sql
SELECT
  id,
  order_number,
  payment_method,
  payment_status,
  razorpay_order_id,
  razorpay_payment_id,
  payment_verified_at,
  grand_total
FROM orders
ORDER BY created_at DESC;
```

A verified payment should show:

```text
payment_status = paid
razorpay_order_id = order_...
razorpay_payment_id = pay_...
payment_verified_at = timestamp
```
