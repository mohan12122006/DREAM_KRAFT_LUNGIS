BEGIN;

-- =========================================================
-- ORDER NUMBER MUST BE UNIQUE
-- =========================================================

CREATE UNIQUE INDEX IF NOT EXISTS
    ux_orders_order_number
ON public.orders(order_number);


-- =========================================================
-- FAST CUSTOMER ORDER HISTORY
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_orders_user_created_at
ON public.orders(user_id, created_at DESC);


-- =========================================================
-- FAST ORDER -> ORDER ITEMS LOOKUP
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_order_items_order_id
ON public.order_items(order_id);


-- =========================================================
-- FAST SELLER ORDER LOOKUP
-- =========================================================

CREATE INDEX IF NOT EXISTS
    idx_order_items_seller_id
ON public.order_items(seller_id);


COMMIT;


-- =========================================================
-- VERIFY
-- =========================================================

SELECT
    id,
    order_number,
    user_id,
    subtotal,
    delivery_charge,
    discount,
    grand_total,
    order_status,
    created_at
FROM public.orders
ORDER BY id DESC
LIMIT 20;


SELECT
    id,
    order_id,
    product_id,
    seller_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    seller_status
FROM public.order_items
ORDER BY id DESC
LIMIT 30;