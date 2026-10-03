import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';

export default function Confirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { api.getOrder(id).then(setOrder); }, [id]);
  if (!order) return <section className="content-section"><Loading /></section>;
  return (
    <section className="confirmation-page content-section">
      <div className="confirmation-card">
        <p className="eyebrow">ORDER PLACED SUCCESSFULLY!</p>
        <h1>{order.orderNumber}</h1>
        <p>Thank you, {order.customerName}. Your order status is <strong>{order.orderStatus}</strong>.</p>
        <div className="confirmation-grid">
          <p><span>Total amount</span><strong>{formatMoney(order.grandTotal)}</strong></p>
          <p><span>Payment method</span><strong>{order.paymentMethod}</strong></p>
          <p><span>Estimated delivery</span><strong>{new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN')}</strong></p>
          <p><span>Delivery address</span><strong>{order.doorNumber}, {order.street}, {order.city}, {order.state} - {order.pinCode}</strong></p>
        </div>
        <h2>Ordered Products</h2>
        {order.items.map(item => <p className="order-line" key={item.id}><span>{item.productName} x {item.quantity}</span><strong>{formatMoney(item.totalPrice)}</strong></p>)}
        <div className="hero-actions"><Link className="btn" to="/account">TRACK ORDER</Link><Link className="btn btn-primary" to="/shop">CONTINUE SHOPPING</Link></div>
      </div>
    </section>
  );
}
