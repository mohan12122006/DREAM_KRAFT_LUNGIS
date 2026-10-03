import * as couponRepo from '../repositories/couponRepo.js';
import * as orderRepo from '../repositories/orderRepo.js';
import * as productRepo from '../repositories/productRepo.js';
import * as reviewRepo from '../repositories/reviewRepo.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';

import {
  clean,
  isEmail,
  isIndianMobile,
  isPinCode
} from '../utils/validation.js';

/* =========================================================
   DELIVERY SETTINGS
========================================================= */

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 49;

/* =========================================================
   CALCULATE CHECKOUT
========================================================= */

async function calculate(items, couponCode) {
  const lines = await Promise.all(
    items.map(async item => {
      const product =
        await productRepo.getBySlugOrId(
          Number(item.productId)
        );

      if (!product) {
        throw Object.assign(
          new Error('Product not found'),
          { status: 404 }
        );
      }

      const quantity = Math.max(
        1,
        Number(item.quantity || 1)
      );

      if (
        product.stockQuantity <
        quantity
      ) {
        throw Object.assign(
          new Error(
            `${product.name} does not have enough stock`
          ),
          { status: 409 }
        );
      }

      const variant =
        product.variants.find(
          row =>
            row.id === item.variantId
        ) ||
        product.variants[0] ||
        null;

      if (
        item.variantId &&
        !product.variants.some(
          row =>
            row.id === item.variantId
        )
      ) {
        throw Object.assign(
          new Error(
            `${product.name} selected variant is not available`
          ),
          { status: 409 }
        );
      }

      const totalPrice =
        Number(product.salePrice) *
        quantity;

      return {
        product,
        variant,
        quantity,
        totalPrice
      };
    })
  );

  /* =======================================================
     COMBINED CHECKOUT SUBTOTAL
  ======================================================= */

  const subtotal = lines.reduce(
    (sum, item) =>
      sum + item.totalPrice,
    0
  );

  /* =======================================================
     COMBINED DISCOUNT
  ======================================================= */

  let discount = 0;

  if (subtotal > 1499) {
    discount += 120;
  }

  const coupon =
    await couponRepo.findActiveByCode(
      couponCode
    );

  const couponApplied =
    Boolean(
      coupon &&
      subtotal >=
        Number(
          coupon.minimumOrderValue || 0
        )
    );

  if (couponApplied) {
    if (
      coupon.discountType ===
      'percentage'
    ) {
      const percentageDiscount =
        subtotal *
        (
          Number(
            coupon.discountValue
          ) / 100
        );

      discount += Math.min(
        Number(
          coupon.maximumDiscount ||
            percentageDiscount
        ),
        percentageDiscount
      );
    }

    if (
      coupon.discountType ===
      'delivery'
    ) {
      const possibleDelivery =
        lines.reduce(
          (sum, line) => {
            const lineSubtotal =
              Number(
                line.totalPrice
              );

            const lineDelivery =
              lineSubtotal >=
              FREE_DELIVERY_LIMIT
                ? 0
                : DELIVERY_CHARGE;

            return (
              sum + lineDelivery
            );
          },
          0
        );

      discount += Math.min(
        Number(
          coupon.maximumDiscount ||
            possibleDelivery
        ),
        possibleDelivery
      );
    }
  }

  return {
    lines,
    subtotal,
    discount:
      Math.round(discount),
    coupon:
      couponApplied
        ? coupon
        : null
  };
}

/* =========================================================
   CREATE ORDER
========================================================= */

export const createOrder =
  asyncHandler(
    async (req, res) => {
      const required = [
        'customerName',
        'mobileNumber',
        'email',
        'doorNumber',
        'street',
        'city',
        'district',
        'state',
        'pinCode',
        'paymentMethod'
      ];

      if (
        required.some(
          key => !req.body[key]
        )
      ) {
        return fail(
          res,
          'All customer and delivery fields are required'
        );
      }

      if (
        !isEmail(
          req.body.email
        ) ||
        !isIndianMobile(
          req.body.mobileNumber
        ) ||
        !isPinCode(
          req.body.pinCode
        )
      ) {
        return fail(
          res,
          'Email, mobile number or PIN code format is invalid'
        );
      }

      if (
        !Array.isArray(
          req.body.items
        ) ||
        !req.body.items.length
      ) {
        return fail(
          res,
          'Order must contain at least one item'
        );
      }

      const totals =
        await calculate(
          req.body.items,
          req.body.couponCode
        );

      const baseOrder = {
        userId:
          req.user?.id || null,

        customerName:
          clean(
            req.body.customerName
          ),

        mobileNumber:
          clean(
            req.body.mobileNumber
          ),

        email:
          String(
            req.body.email
          )
            .trim()
            .toLowerCase(),

        doorNumber:
          clean(
            req.body.doorNumber
          ),

        street:
          clean(
            req.body.street
          ),

        city:
          clean(
            req.body.city
          ),

        district:
          clean(
            req.body.district
          ),

        state:
          clean(
            req.body.state
          ),

        pinCode:
          clean(
            req.body.pinCode
          ),

        paymentMethod:
          req.body.paymentMethod,

        paymentStatus:
          req.body.paymentMethod ===
          'Cash on Delivery'
            ? 'pending'
            : 'payment_pending',

        orderStatus:
          'confirmed',

        estimatedDeliveryDate:
          new Date(
            Date.now() +
              5 *
                86400000
          ).toISOString()
      };

      const items =
        totals.lines.map(
          line => ({
            productId:
              line.product.id,

            sellerId:
              line.product.sellerId ||
              null,

            variantId:
              line.variant?.id ||
              null,

            productName:
              line.product.name,

            colour:
              line.variant?.colour ||
              null,

            sizeOrLength:
              line.variant
                ?.sizeOrLength ||
              null,

            quantity:
              line.quantity,

            unitPrice:
              Number(
                line.product
                  .salePrice
              ),

            totalPrice:
              Number(
                line.totalPrice
              )
          })
        );

      const saved =
        await orderRepo.create(
          baseOrder,
          items,
          {
            combinedSubtotal:
              totals.subtotal,

            combinedDiscount:
              totals.discount,

            couponCode:
              totals.coupon
                ?.code || null
          }
        );

      return ok(
        res,
        saved,
        201
      );
    }
  );

/* =========================================================
   LIST CUSTOMER ORDERS
========================================================= */

export const listOrders =
  asyncHandler(
    async (req, res) => {
      return ok(
        res,
        await orderRepo.listForUser(
          req.user.id,
          req.user.role ===
            'admin'
        )
      );
    }
  );

/* =========================================================
   GET SINGLE ORDER
========================================================= */

export const getOrder =
  asyncHandler(
    async (req, res) => {
      const order =
        await orderRepo.getById(
          Number(
            req.params.id
          )
        );

      if (!order) {
        return fail(
          res,
          'Order not found',
          404
        );
      }

      if (
        order.userId &&
        req.user?.id !==
          order.userId &&
        req.user?.role !==
          'admin'
      ) {
        return fail(
          res,
          'Access denied',
          403
        );
      }

      return ok(
        res,
        order
      );
    }
  );

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export const updateOrderStatus =
  asyncHandler(
    async (req, res) => {
      const order =
        await orderRepo.updateStatus(
          Number(
            req.params.id
          ),
          clean(
            req.body.status
          )
        );

      if (!order) {
        return fail(
          res,
          'Order not found',
          404
        );
      }

      return ok(
        res,
        order
      );
    }
  );

/* =========================================================
   CANCEL ORDER ITEM
========================================================= */

export const cancelOrderItem =
  asyncHandler(
    async (req, res) => {
      const orderItemId =
        Number(
          req.params.orderItemId
        );

      if (
        !orderItemId ||
        Number.isNaN(orderItemId)
      ) {
        return fail(
          res,
          'Valid order item ID is required',
          400
        );
      }

      /*
       * Customer can cancel only
       * their own order item.
       */
      const result =
        await orderRepo.cancelOrderItem(
          orderItemId,
          req.user.id
        );

      if (
        !result ||
        result.notFound
      ) {
        return fail(
          res,
          'Order item not found',
          404
        );
      }

      if (
        result.alreadyCancelled
      ) {
        return fail(
          res,
          'This product is already cancelled',
          409
        );
      }

      if (
        result.cannotCancel
      ) {
        return fail(
          res,
          'This product cannot be cancelled because it has already been processed for shipping',
          409
        );
      }

      return ok(
        res,
        result
      );
    }
  );

/* =========================================================
   CREATE PRODUCT REVIEW
========================================================= */

export const createReview =
  asyncHandler(
    async (req, res) => {
      const rating =
        Number(
          req.body.rating
        );

      if (
        rating < 1 ||
        rating > 5
      ) {
        return fail(
          res,
          'Rating must be between one and five'
        );
      }

      const productId =
        Number(
          req.params.productId
        );

      const orderItemId =
        Number(
          req.body.orderItemId
        );

      if (!orderItemId) {
        return fail(
          res,
          'Order item ID is required'
        );
      }

      const reviewText =
        clean(
          req.body.reviewText ||
            ''
        );

      if (!reviewText) {
        return fail(
          res,
          'Review text is required'
        );
      }

      const reviewImageUrl =
        typeof req.body
          .reviewImageUrl ===
          'string' &&
        req.body.reviewImageUrl.trim()
          ? req.body.reviewImageUrl.trim()
          : null;

      const duplicate =
        await reviewRepo.exists(
          req.user.id,
          productId,
          orderItemId
        );

      if (duplicate) {
        return fail(
          res,
          'You already reviewed this order item',
          409
        );
      }

      const review =
        await reviewRepo.create({
          userId:
            req.user.id,

          productId,

          orderItemId,

          rating,

          reviewText,

          reviewImageUrl
        });

      return ok(
        res,
        review,
        201
      );
    }
  );