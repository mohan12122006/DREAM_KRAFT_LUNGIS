import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, message, action = 'Continue Shopping', to = '/shop' }) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <Link className="btn btn-primary" to={to}>{action}</Link>
    </section>
  );
}
