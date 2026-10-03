import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney } from '../utils/money.js';

export default function Cart() {
  const { items, totals, updateQuantity, removeItem } = useCart();
  if (!items.length) return <EmptyState title="Your cart is empty" message="Premium cotton comfort is waiting in the shop." />;
  return (
    <section className="cart-page content-section">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <article className="cart-item" key={`${item.product.id}-${item.variantId || 'base'}`}>
              <img src={item.product.images?.[0]?.imageUrl || item.product.imageUrl} alt={item.product.name} />
              <div><h2>{item.product.name}</h2><p>{item.product.categoryName}</p><strong>{formatMoney(item.product.salePrice)}</strong></div>
              <label>Qty<input type="number" min="1" value={item.quantity} onChange={event => updateQuantity(item.product.id, event.target.value)} /></label>
              <button className="text-button" onClick={() => removeItem(item.product.id)}>Remove</button>
            </article>
          ))}
        </div>
        <aside className="summary-card">
          <h2>Order Summary</h2>
          <p><span>Subtotal</span><strong>{formatMoney(totals.subtotal)}</strong></p>
          <p><span>Delivery charge</span><strong>{formatMoney(totals.delivery)}</strong></p>
          <p><span>Discount</span><strong>-{formatMoney(totals.discount)}</strong></p>
          <p className="grand-total"><span>Final total</span><strong>{formatMoney(totals.grandTotal)}</strong></p>
          <Link className="btn" to="/shop">CONTINUE SHOPPING</Link>
          <Link className="btn btn-primary" to="/checkout">PROCEED TO CHECKOUT</Link>
        </aside>
      </div>
    </section>
  );
}
