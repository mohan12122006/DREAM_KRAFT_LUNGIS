BEGIN;

CREATE TABLE IF NOT EXISTS public.seller_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,

    store_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(180),

    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(12),

    business_description TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_seller_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    CONSTRAINT seller_profiles_status_check
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'suspended'
            )
        )
);

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS seller_id BIGINT;

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS seller_id BIGINT;

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS seller_status VARCHAR(40)
NOT NULL DEFAULT 'confirmed';

CREATE INDEX IF NOT EXISTS idx_products_seller
ON public.products(seller_id);

CREATE INDEX IF NOT EXISTS idx_order_items_seller
ON public.order_items(seller_id);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_status
ON public.seller_profiles(status);

INSERT INTO public.users (
    name,
    email,
    password_hash,
    phone,
    role
)
VALUES (
    'Demo Seller',
    'seller@dreamkraftlungis.in',
    '$2a$10$kF5ThUM0apmWSZdN5YS16O9V6Gq7d8I7HrNURZiaKqpHkK3Gfw7Qy',
    '9876543211',
    'seller'
)
ON CONFLICT (email)
DO UPDATE SET
    role = 'seller';

INSERT INTO public.seller_profiles (
    user_id,
    store_name,
    phone,
    email,
    city,
    district,
    state,
    pin_code,
    business_description,
    status
)
SELECT
    id,
    'Dream Kraft Traditional Store',
    phone,
    email,
    'Chennai',
    'Chennai',
    'Tamil Nadu',
    '600001',
    'Traditional cotton lungis and comfortable Indian menswear.',
    'approved'
FROM public.users
WHERE email = 'seller@dreamkraftlungis.in'
ON CONFLICT (user_id)
DO UPDATE SET
    status = 'approved',
    updated_at = NOW();

COMMIT;