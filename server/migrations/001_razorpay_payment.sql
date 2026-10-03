-- DREAM KRAFT LUNGIS
-- Razorpay test-mode payment fields and webhook idempotency.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_session_token VARCHAR(128),
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_signature VARCHAR(255),
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_session_token_uidx
  ON orders(payment_session_token)
  WHERE payment_session_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_uidx
  ON orders(razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_payment_id_uidx
  ON orders(razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_name VARCHAR(100),
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS payment_webhook_events_received_at_idx
  ON payment_webhook_events(received_at DESC);
