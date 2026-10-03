import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);
const CART_KEY = 'dkl_guest_cart';

const FREE_DELIVERY_LIMIT = 999;
const DELIVERY_CHARGE = 49;
const DISCOUNT_LIMIT = 1499;
const DISCOUNT_AMOUNT = 120;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState(
    () => JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  );

  const [wishlist, setWishlist] = useState(
    () => JSON.parse(localStorage.getItem('dkl_wishlist') || '[]')
  );

  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      localStorage.setItem('dkl_wishlist', JSON.stringify(wishlist));
    }
  }, [items, wishlist, user]);

  useEffect(() => {
    if (!user) return;

    const guestItems = JSON.parse(
      localStorage.getItem(CART_KEY) || '[]'
    );

    Promise.all(
      guestItems.map(item =>
        api
          .addCartItem({
            productId: item.product.id,
            variantId: item.variantId,
            quantity: item.quantity
          })
          .catch(() => null)
      )
    )
      .then(() => api.getCart())
      .then(cart => {
        setItems(cart.items);
        localStorage.removeItem(CART_KEY);
      })
      .catch(() => {});

    api.getWishlist()
      .then(setWishlist)
      .catch(() => {});
  }, [user]);

  const addItem = async (
    product,
    quantity = 1,
    variantId = null,
    redirect = false
  ) => {
    if (product.stockQuantity <= 0) {
      return showToast(
        'This product is currently out of stock',
        'error'
      );
    }

    if (user) {
      const cart = await api.addCartItem({
        productId: product.id,
        quantity,
        variantId
      });

      setItems(cart.items);
    } else {
      setItems(current => {
        const match = current.find(
          item =>
            item.product.id === product.id &&
            item.variantId === variantId
        );

        if (match) {
          return current.map(item =>
            item === match
              ? {
                  ...item,
                  quantity: item.quantity + quantity
                }
              : item
          );
        }

        return [
          ...current,
          {
            product,
            quantity,
            variantId
          }
        ];
      });
    }

    showToast(`${product.name} added to cart`);

    return redirect;
  };

  const updateQuantity = async (productId, quantity) => {
    const nextQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    if (user) {
      const cart = await api.updateCartItem(
        productId,
        {
          quantity: nextQuantity
        }
      );

      setItems(cart.items);
    } else {
      setItems(current =>
        current.map(item =>
          item.product.id === productId
            ? {
                ...item,
                quantity: nextQuantity
              }
            : item
        )
      );
    }
  };

  const removeItem = async productId => {
    if (user) {
      const cart = await api.removeCartItem(productId);
      setItems(cart.items);
    } else {
      setItems(current =>
        current.filter(
          item => item.product.id !== productId
        )
      );
    }

    showToast('Item removed from cart');
  };

  const clearCart = async () => {
    if (user) {
      await api
        .clearCart()
        .then(cart => setItems(cart.items));
    } else {
      setItems([]);
    }
  };

  const toggleWishlist = async product => {
    const exists = wishlist.some(
      item =>
        item.id === product.id ||
        item.product?.id === product.id
    );

    if (user) {
      const next = exists
        ? await api.removeWishlist(product.id)
        : await api.addWishlist(product.id);

      setWishlist(next);
    } else {
      setWishlist(current =>
        exists
          ? current.filter(item => item.id !== product.id)
          : [...current, product]
      );
    }

    showToast(
      exists
        ? 'Removed from wishlist'
        : 'Added to wishlist'
    );
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item.product.salePrice || 0) *
          Number(item.quantity || 0),
      0
    );

    // FREE delivery for orders of ₹999 or more.
    const delivery =
      subtotal >= FREE_DELIVERY_LIMIT
        ? 0
        : subtotal === 0
          ? 0
          : DELIVERY_CHARGE;

    // Existing project discount rule.
    const discount =
      subtotal > DISCOUNT_LIMIT
        ? DISCOUNT_AMOUNT
        : 0;

    const grandTotal = Math.max(
      0,
      subtotal + delivery - discount
    );

    return {
      subtotal,
      delivery,
      discount,
      grandTotal
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      wishlist,

      cartCount: items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),

      wishlistCount: wishlist.length,

      totals,

      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toggleWishlist
    }),
    [items, wishlist, totals]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () =>
  useContext(CartContext);