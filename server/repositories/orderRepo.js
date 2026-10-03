import { orders, products } from '../data.js';
import { pool } from '../config/database.js';
import { num, usingDatabase } from './db.js';

// =========================================================
// CONSTANTS
// =========================================================

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 49;

// =========================================================
// MAP ORDER DATABASE ROW
// =========================================================

const mapOrderRow = row =>
  row && {
    id: num(row.id),
    userId: num(row.user_id),
    orderNumber: row.order_number,
    customerName: row.customer_name,
    mobileNumber: row.mobile_number,
    email: row.email,
    doorNumber: row.door_number,
    street: row.street,
    city: row.city,
    district: row.district,
    state: row.state,
    pinCode: row.pin_code,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    subtotal: Number(row.subtotal),
    deliveryCharge: Number(row.delivery_charge),
    discount: Number(row.discount),
    grandTotal: Number(row.grand_total),
    estimatedDeliveryDate: row.estimated_delivery_date,
    createdAt: row.created_at
  };

// =========================================================
// MAP ORDER ITEM
// Includes seller details for invoice
// =========================================================

const mapItemRow = row => ({
  id: num(row.id),
  productId: num(row.product_id),
  sellerId: num(row.seller_id),
  variantId: num(row.variant_id),

  productName: row.product_name,
  colour: row.colour,
  sizeOrLength: row.size_or_length,

  quantity: Number(row.quantity),
  unitPrice: Number(row.unit_price),
  totalPrice: Number(row.total_price),

  // Seller information
  seller: row.seller_id
    ? {
        id: num(row.seller_id),

        name: row.seller_name || '',
        storeName: row.seller_store_name || '',

        phone: row.seller_phone || '',
        email: row.seller_email || '',

        address: row.seller_address || '',
        city: row.seller_city || '',
        district: row.seller_district || '',
        state: row.seller_state || '',
        pinCode: row.seller_pin_code || ''
      }
    : null
});

// =========================================================
// CREATE ORDERS
// =========================================================

export async function create(
  baseOrder,
  items,
  options = {}
) {
  const combinedSubtotal = Number(
    options.combinedSubtotal || 0
  );

  const combinedDiscount = Number(
    options.combinedDiscount || 0
  );

  const couponCode =
    options.couponCode || null;

  // Free delivery is calculated using
  // the complete checkout subtotal.

  const isFreeDelivery =
    combinedSubtotal >= FREE_DELIVERY_LIMIT;

  // =======================================================
  // IN-MEMORY DEMO MODE
  // =======================================================

  if (!usingDatabase()) {
    const createdOrders = [];

    // -----------------------------------------------------
    // CHECK STOCK FIRST
    // -----------------------------------------------------

    for (const item of items) {
      const product = products.find(
        row => row.id === item.productId
      );

      if (
        !product ||
        product.stockQuantity < item.quantity
      ) {
        throw Object.assign(
          new Error(
            `${item.productName} does not have enough stock`
          ),
          { status: 409 }
        );
      }
    }

    // -----------------------------------------------------
    // DISCOUNT TRACKING
    // -----------------------------------------------------

    let remainingDiscount =
      combinedDiscount;

    // -----------------------------------------------------
    // CREATE ONE ORDER PER PRODUCT
    // -----------------------------------------------------

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      const product = products.find(
        row => row.id === item.productId
      );

      // ---------------------------------------------------
      // INDIVIDUAL ORDER SUBTOTAL
      // ---------------------------------------------------

      const subtotal =
        Number(item.totalPrice);

      // ---------------------------------------------------
      // DELIVERY
      // ---------------------------------------------------

      const deliveryCharge =
        isFreeDelivery
          ? 0
          : DELIVERY_CHARGE;

      // ---------------------------------------------------
      // ALLOCATE COMBINED DISCOUNT
      // ---------------------------------------------------

      let discount = 0;

      if (
        combinedSubtotal > 0 &&
        combinedDiscount > 0
      ) {
        if (
          index === items.length - 1
        ) {
          discount = Math.min(
            remainingDiscount,
            subtotal
          );
        } else {
          discount = Math.min(
            Math.round(
              combinedDiscount *
                (subtotal /
                  combinedSubtotal)
            ),
            subtotal
          );
        }

        remainingDiscount = Math.max(
          0,
          remainingDiscount - discount
        );
      }

      // ---------------------------------------------------
      // GRAND TOTAL
      // ---------------------------------------------------

      const grandTotal = Math.max(
        0,
        subtotal +
          deliveryCharge -
          discount
      );

      // ---------------------------------------------------
      // UPDATE PRODUCT STOCK
      // ---------------------------------------------------

      product.stockQuantity -=
        item.quantity;

      // ---------------------------------------------------
      // UPDATE VARIANT STOCK
      // ---------------------------------------------------

      const variant =
        product.variants?.find(
          row =>
            row.id === item.variantId
        );

      if (variant) {
        variant.stockQuantity =
          Math.max(
            0,
            variant.stockQuantity -
              item.quantity
          );
      }

      // ---------------------------------------------------
      // CREATE UNIQUE ORDER ID
      // ---------------------------------------------------

      const orderId =
        orders.length + 1;

      // ---------------------------------------------------
      // CREATE UNIQUE ORDER NUMBER
      // ---------------------------------------------------

      const orderNumber =
        `DKL-${new Date().getFullYear()}-${Date.now()
          .toString()
          .slice(-8)}-${index + 1}`;

      // ---------------------------------------------------
      // CREATE ORDER RECORD
      // ---------------------------------------------------

      const record = {
        id: orderId,

        ...baseOrder,

        orderNumber,

        subtotal,
        deliveryCharge,
        discount,
        grandTotal,

        items: [
          {
            id: `${orderId}-1`,
            ...item
          }
        ]
      };

      orders.push(record);
      createdOrders.push(record);
    }

    // -----------------------------------------------------
    // RETURN SPLIT ORDERS
    // -----------------------------------------------------

    return {
      ...createdOrders[0],

      orders: createdOrders,

      orderIds:
        createdOrders.map(
          order => order.id
        ),

      orderNumbers:
        createdOrders.map(
          order => order.orderNumber
        )
    };
  }

  // =======================================================
  // POSTGRESQL
  // =======================================================

  const client =
    await pool.connect();

  try {
    await client.query('BEGIN');

    // -----------------------------------------------------
    // CHECK STOCK FIRST
    // -----------------------------------------------------

    for (const item of items) {
      const { rows } =
        await client.query(
          `
          SELECT stock_quantity
          FROM products
          WHERE id = $1
          FOR UPDATE
          `,
          [item.productId]
        );

      if (!rows.length) {
        throw Object.assign(
          new Error(
            `${item.productName} is no longer available`
          ),
          { status: 404 }
        );
      }

      if (
        Number(
          rows[0].stock_quantity
        ) < Number(item.quantity)
      ) {
        throw Object.assign(
          new Error(
            `${item.productName} does not have enough stock`
          ),
          { status: 409 }
        );
      }
    }

    // -----------------------------------------------------
    // DISCOUNT TRACKING
    // -----------------------------------------------------

    let remainingDiscount =
      combinedDiscount;

    const createdOrders = [];

    // -----------------------------------------------------
    // CREATE ONE ORDER PER PRODUCT
    // -----------------------------------------------------

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      // ---------------------------------------------------
      // INDIVIDUAL ORDER SUBTOTAL
      // ---------------------------------------------------

      const subtotal =
        Number(item.totalPrice);

      // ---------------------------------------------------
      // DELIVERY
      // ---------------------------------------------------

      const deliveryCharge =
        isFreeDelivery
          ? 0
          : DELIVERY_CHARGE;

      // ---------------------------------------------------
      // DISTRIBUTE CHECKOUT DISCOUNT
      // ---------------------------------------------------

      let discount = 0;

      if (
        combinedSubtotal > 0 &&
        combinedDiscount > 0
      ) {
        if (
          index === items.length - 1
        ) {
          discount = Math.min(
            remainingDiscount,
            subtotal
          );
        } else {
          discount = Math.min(
            Math.round(
              combinedDiscount *
                (subtotal /
                  combinedSubtotal)
            ),
            subtotal
          );
        }

        remainingDiscount = Math.max(
          0,
          remainingDiscount - discount
        );
      }

      // ---------------------------------------------------
      // GRAND TOTAL
      // ---------------------------------------------------

      const grandTotal = Math.max(
        0,
        subtotal +
          deliveryCharge -
          discount
      );

      // ---------------------------------------------------
      // UNIQUE ORDER NUMBER
      // ---------------------------------------------------

      const orderNumber =
        `DKL-${new Date().getFullYear()}-${Date.now()
          .toString()
          .slice(-8)}-${index + 1}`;

      // ---------------------------------------------------
      // INSERT ORDER
      // ---------------------------------------------------

      const {
        rows: orderRows
      } = await client.query(
        `
        INSERT INTO orders
        (
          user_id,
          order_number,
          customer_name,
          mobile_number,
          email,
          door_number,
          street,
          city,
          district,
          state,
          pin_code,
          payment_method,
          payment_status,
          order_status,
          subtotal,
          delivery_charge,
          discount,
          grand_total,
          estimated_delivery_date
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17,
          $18,
          $19
        )
        RETURNING *
        `,
        [
          baseOrder.userId,
          orderNumber,
          baseOrder.customerName,
          baseOrder.mobileNumber,
          baseOrder.email,
          baseOrder.doorNumber,
          baseOrder.street,
          baseOrder.city,
          baseOrder.district,
          baseOrder.state,
          baseOrder.pinCode,
          baseOrder.paymentMethod,
          baseOrder.paymentStatus,
          baseOrder.orderStatus,
          subtotal,
          deliveryCharge,
          discount,
          grandTotal,
          baseOrder.estimatedDeliveryDate
        ]
      );

      const savedOrder =
        orderRows[0];

      // ---------------------------------------------------
      // INSERT ORDER ITEM
      // ---------------------------------------------------

      const {
        rows: itemRows
      } = await client.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          seller_id,
          variant_id,
          product_name,
          colour,
          size_or_length,
          quantity,
          unit_price,
          total_price
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        RETURNING *
        `,
        [
          savedOrder.id,
          item.productId,
          item.sellerId || null,
          item.variantId || null,
          item.productName,
          item.colour,
          item.sizeOrLength,
          item.quantity,
          item.unitPrice,
          item.totalPrice
        ]
      );

      // ---------------------------------------------------
      // UPDATE PRODUCT STOCK
      // ---------------------------------------------------

      await client.query(
        `
        UPDATE products
        SET
          stock_quantity =
            stock_quantity - $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          item.quantity,
          item.productId
        ]
      );

      // ---------------------------------------------------
      // UPDATE VARIANT STOCK
      // ---------------------------------------------------

      if (item.variantId) {
        await client.query(
          `
          UPDATE product_variants
          SET
            stock_quantity =
              GREATEST(
                stock_quantity - $1,
                0
              )
          WHERE id = $2
          `,
          [
            item.quantity,
            item.variantId
          ]
        );
      }

      // ---------------------------------------------------
      // STORE CREATED ORDER
      // ---------------------------------------------------

      createdOrders.push({
        ...mapOrderRow(
          savedOrder
        ),

        items:
          itemRows.map(
            mapItemRow
          )
      });
    }

    // -----------------------------------------------------
    // COUPON USAGE
    // -----------------------------------------------------

    if (couponCode) {
      await client.query(
        `
        UPDATE coupons
        SET
          used_count =
            used_count + 1
        WHERE code = $1
        `,
        [
          String(
            couponCode
          ).toUpperCase()
        ]
      );
    }

    // -----------------------------------------------------
    // COMMIT
    // -----------------------------------------------------

    await client.query('COMMIT');

    // -----------------------------------------------------
    // RETURN
    // -----------------------------------------------------

    return {
      ...createdOrders[0],

      orders: createdOrders,

      orderIds:
        createdOrders.map(
          order => order.id
        ),

      orderNumbers:
        createdOrders.map(
          order => order.orderNumber
        )
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// =========================================================
// ATTACH ITEMS TO ORDER
//
// Includes seller information:
//
// users
// seller_profiles
// order_items
// =========================================================

async function attachItems(
  order,
  client
) {
  if (!order) {
    return null;
  }

  const { rows } =
    await client.query(
      `
      SELECT
        oi.*,

        -- Seller user information
        u.name AS seller_name,

        -- Seller profile information
        sp.store_name AS seller_store_name,

        COALESCE(
          sp.phone,
          u.phone
        ) AS seller_phone,

        COALESCE(
          sp.email,
          u.email
        ) AS seller_email,

        sp.address AS seller_address,
        sp.city AS seller_city,
        sp.district AS seller_district,
        sp.state AS seller_state,
        sp.pin_code AS seller_pin_code

      FROM order_items oi

      LEFT JOIN users u
        ON u.id = oi.seller_id

      LEFT JOIN seller_profiles sp
        ON sp.user_id = oi.seller_id

      WHERE oi.order_id = $1

      ORDER BY oi.id ASC
      `,
      [order.id]
    );

  return {
    ...order,

    items:
      rows.map(
        mapItemRow
      )
  };
}

// =========================================================
// LIST CUSTOMER ORDERS
// =========================================================

export async function listForUser(
  userId,
  isAdmin
) {
  // -------------------------------------------------------
  // IN-MEMORY MODE
  // -------------------------------------------------------

  if (!usingDatabase()) {
    return orders
      .filter(
        order =>
          order.userId === userId ||
          isAdmin
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
  }

  // -------------------------------------------------------
  // DATABASE MODE
  // -------------------------------------------------------

  const sql =
    isAdmin
      ? `
        SELECT *
        FROM orders
        ORDER BY created_at DESC
      `
      : `
        SELECT *
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

  const {
    rows
  } = await pool.query(
    sql,
    isAdmin
      ? []
      : [userId]
  );

  return Promise.all(
    rows.map(
      row =>
        attachItems(
          mapOrderRow(row),
          pool
        )
    )
  );
}

// =========================================================
// GET SINGLE ORDER
// =========================================================

export async function getById(
  id
) {
  // -------------------------------------------------------
  // IN-MEMORY MODE
  // -------------------------------------------------------

  if (!usingDatabase()) {
    return (
      orders.find(
        item =>
          item.id ===
          Number(id)
      ) ||
      null
    );
  }

  // -------------------------------------------------------
  // DATABASE MODE
  // -------------------------------------------------------

  const {
    rows
  } = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1
    `,
    [id]
  );

  if (!rows.length) {
    return null;
  }

  return attachItems(
    mapOrderRow(
      rows[0]
    ),
    pool
  );
}

// =========================================================
// UPDATE ORDER STATUS
// =========================================================

export async function updateStatus(
  id,
  status
) {
  // -------------------------------------------------------
  // IN-MEMORY MODE
  // -------------------------------------------------------

  if (!usingDatabase()) {
    const order =
      orders.find(
        item =>
          item.id ===
          Number(id)
      );

    if (order) {
      order.orderStatus =
        status;
    }

    return (
      order ||
      null
    );
  }

  // -------------------------------------------------------
  // DATABASE MODE
  // -------------------------------------------------------

  const {
    rows
  } = await pool.query(
    `
    UPDATE orders
    SET
      order_status = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [
      status,
      id
    ]
  );

  if (!rows.length) {
    return null;
  }

  return attachItems(
    mapOrderRow(
      rows[0]
    ),
    pool
  );

}
// =========================================================
// CANCEL ORDER ITEM
// Customer can cancel a product before it is shipped
// =========================================================

export async function cancelOrderItem(
  orderItemId,
  userId
) {
  // -------------------------------------------------------
  // CANCELLABLE STATUSES
  // -------------------------------------------------------

  const cancellableStatuses = [
    'pending',
    'confirmed',
    'processing',
    'packed'
  ];

  // =======================================================
  // IN-MEMORY DEMO MODE
  // =======================================================

  if (!usingDatabase()) {
    let foundOrder = null;
    let foundItem = null;

    for (const order of orders) {
      const item = order.items?.find(
        row => String(row.id) === String(orderItemId)
      );

      if (item) {
        foundOrder = order;
        foundItem = item;
        break;
      }
    }

    if (!foundOrder || !foundItem) {
      return {
        notFound: true
      };
    }

    // Check customer ownership
    if (
      foundOrder.userId !== userId
    ) {
      return {
        notFound: true
      };
    }

    const currentStatus =
      foundOrder.orderStatus || 'pending';

    // Already cancelled
    if (
      currentStatus === 'cancelled' ||
      foundItem.sellerStatus === 'cancelled'
    ) {
      return {
        alreadyCancelled: true
      };
    }

    // Cannot cancel after shipping
    if (
      !cancellableStatuses.includes(
        currentStatus
      )
    ) {
      return {
        cannotCancel: true
      };
    }

    // -----------------------------------------------------
    // RESTORE PRODUCT STOCK
    // -----------------------------------------------------

    const product = products.find(
      row =>
        Number(row.id) ===
        Number(foundItem.productId)
    );

    if (product) {
      product.stockQuantity =
        Number(product.stockQuantity || 0) +
        Number(foundItem.quantity || 0);

      // ---------------------------------------------------
      // RESTORE VARIANT STOCK
      // ---------------------------------------------------

      if (foundItem.variantId) {
        const variant =
          product.variants?.find(
            row =>
              Number(row.id) ===
              Number(foundItem.variantId)
          );

        if (variant) {
          variant.stockQuantity =
            Number(
              variant.stockQuantity || 0
            ) +
            Number(
              foundItem.quantity || 0
            );
        }
      }
    }

    // -----------------------------------------------------
    // UPDATE ITEM STATUS
    // -----------------------------------------------------

    foundItem.sellerStatus =
      'cancelled';

    // -----------------------------------------------------
    // UPDATE ORDER STATUS
    // -----------------------------------------------------

    foundOrder.orderStatus =
      'cancelled';

    return {
      success: true,
      message:
        'Product cancelled successfully',
      order: foundOrder,
      orderItem: foundItem
    };
  }

  // =======================================================
  // POSTGRESQL
  // =======================================================

  const client =
    await pool.connect();

  try {
    await client.query('BEGIN');

    // -----------------------------------------------------
    // FIND AND LOCK ORDER ITEM
    // -----------------------------------------------------

    const {
      rows
    } = await client.query(
      `
      SELECT
        oi.*,
        o.user_id,
        o.order_status,
        o.payment_method,
        o.payment_status
      FROM order_items oi
      INNER JOIN orders o
        ON o.id = oi.order_id
      WHERE oi.id = $1
      FOR UPDATE OF oi, o
      `,
      [orderItemId]
    );

    // -----------------------------------------------------
    // ORDER ITEM NOT FOUND
    // -----------------------------------------------------

    if (!rows.length) {
      await client.query('ROLLBACK');

      return {
        notFound: true
      };
    }

    const item = rows[0];

    // -----------------------------------------------------
    // CHECK CUSTOMER OWNERSHIP
    // -----------------------------------------------------

    if (
      Number(item.user_id) !==
      Number(userId)
    ) {
      await client.query('ROLLBACK');

      return {
        notFound: true
      };
    }

    const currentStatus =
      String(
        item.order_status || 'pending'
      ).toLowerCase();

    // -----------------------------------------------------
    // ALREADY CANCELLED
    // -----------------------------------------------------

    if (
      currentStatus === 'cancelled' ||
      String(
        item.seller_status || ''
      ).toLowerCase() === 'cancelled'
    ) {
      await client.query('ROLLBACK');

      return {
        alreadyCancelled: true
      };
    }

    // -----------------------------------------------------
    // CHECK WHETHER CANCELLATION IS ALLOWED
    // -----------------------------------------------------

    if (
      !cancellableStatuses.includes(
        currentStatus
      )
    ) {
      await client.query('ROLLBACK');

      return {
        cannotCancel: true
      };
    }

    // -----------------------------------------------------
    // RESTORE PRODUCT STOCK
    // -----------------------------------------------------

    await client.query(
      `
      UPDATE products
      SET
        stock_quantity =
          stock_quantity + $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [
        Number(item.quantity),
        Number(item.product_id)
      ]
    );

    // -----------------------------------------------------
    // RESTORE VARIANT STOCK
    // -----------------------------------------------------

    if (item.variant_id) {
      await client.query(
        `
        UPDATE product_variants
        SET
          stock_quantity =
            stock_quantity + $1
        WHERE id = $2
        `,
        [
          Number(item.quantity),
          Number(item.variant_id)
        ]
      );
    }

    // -----------------------------------------------------
    // UPDATE ORDER ITEM STATUS
    // -----------------------------------------------------

    await client.query(
      `
      UPDATE order_items
      SET
        seller_status = 'cancelled'
      WHERE id = $1
      `,
      [orderItemId]
    );

    // -----------------------------------------------------
    // UPDATE PARENT ORDER STATUS
    // -----------------------------------------------------

    await client.query(
      `
      UPDATE orders
      SET
        order_status = 'cancelled',
        updated_at = NOW()
      WHERE id = $1
      `,
      [item.order_id]
    );

    // -----------------------------------------------------
    // COMMIT
    // -----------------------------------------------------

    await client.query('COMMIT');

    // -----------------------------------------------------
    // GET UPDATED ORDER
    // -----------------------------------------------------

    const {
      rows: updatedRows
    } = await client.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      `,
      [item.order_id]
    );

    const updatedOrder =
      updatedRows.length
        ? mapOrderRow(updatedRows[0])
        : null;

    // -----------------------------------------------------
    // RETURN RESULT
    // -----------------------------------------------------

    return {
      success: true,
      message:
        'Product cancelled successfully',
      order: updatedOrder,
      orderItemId: Number(orderItemId)
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}