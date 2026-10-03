import React from 'react';
import { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.subscribe(email);
      setEmail('');
      showToast('Subscribed to DREAM KRAFT updates');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">New collections and festival prices</p>
        <h2>STAY UPDATED WITH DREAM KRAFT LUNGIS</h2>
        <p>Get updates about new collections, exclusive offers and festival discounts.</p>
      </div>
      <form onSubmit={submit}>
        <label className="sr-only" htmlFor="newsletter-email">Enter your email address</label>
        <input id="newsletter-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email address" />
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Subscribing...' : 'SUBSCRIBE'}</button>
      </form>
    </section>
  );
}
