const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('dkl_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || 'Something went wrong'
    );
  }

  return data.data;
}

export const api = {
  // =========================
  // PRODUCTS
  // =========================

  getProducts: (query = '') =>
    request(`/products${query}`),

  getProduct: slugOrId =>
    request(`/products/${slugOrId}`),

  getCategories: () =>
    request('/categories'),

  getReviews: productId =>
    request(`/products/${productId}/reviews`),

  // =========================
  // REVIEWS / FEEDBACK
  // =========================

  submitReview: (productId, payload) =>
    request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        orderItemId: payload.orderItemId,
        rating: Number(payload.rating),
        reviewText: payload.reviewText,
        reviewImageUrl:
          payload.reviewImageUrl || null,
      }),
    }),

  // =========================
  // AUTHENTICATION
  // =========================

  register: payload =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: payload =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () =>
    request('/auth/me'),

  changePassword: payload =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // =========================
  // SELLERS
  // =========================

  registerSeller: payload =>
    request('/sellers/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSellerProfile: () =>
    request('/sellers/me'),

  updateSellerProfile: payload =>
    request('/sellers/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getSellerDashboard: () =>
    request('/sellers/dashboard'),

  getSellerProducts: () =>
    request('/sellers/products'),

  createSellerProduct: payload =>
    request('/sellers/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSellerProduct: (id, payload) =>
    request(`/sellers/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteSellerProduct: id =>
    request(`/sellers/products/${id}`, {
      method: 'DELETE',
    }),

  getSellerOrders: () =>
    request('/sellers/orders'),

  updateSellerOrderItemStatus: (
    orderItemId,
    status
  ) =>
    request(
      `/sellers/orders/items/${orderItemId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status,
        }),
      }
    ),

  // =========================
  // ADMIN SELLERS
  // =========================

  getAllSellers: () =>
    request('/sellers/admin/all'),

  updateSellerStatus: (
    userId,
    status
  ) =>
    request(`/sellers/admin/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
      }),
    }),

  // =========================
  // CART
  // =========================

  getCart: () =>
    request('/cart'),

  addCartItem: payload =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCartItem: (
    productId,
    payload
  ) =>
    request(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  removeCartItem: productId =>
    request(`/cart/items/${productId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request('/cart', {
      method: 'DELETE',
    }),

  // =========================
  // WISHLIST
  // =========================

  getWishlist: () =>
    request('/wishlist'),

  addWishlist: productId =>
    request(`/wishlist/${productId}`, {
      method: 'POST',
    }),

  removeWishlist: productId =>
    request(`/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  // =========================
  // COUPONS
  // =========================

  validateCoupon: code =>
    request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({
        code,
      }),
    }),

  // =========================
  // ORDERS
  // =========================

  placeOrder: payload =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrders: () =>
    request('/orders'),

  getOrder: id =>
    request(`/orders/${id}`),

  cancelOrderItem: orderItemId =>
    request(
      `/orders/items/${orderItemId}/cancel`,
      {
        method: 'PUT',
      }
    ),

  // =========================
  // NEWSLETTER
  // =========================

  subscribe: email =>
    request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    }),
};