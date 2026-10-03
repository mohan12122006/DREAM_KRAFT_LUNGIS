import React from 'react';
import Newsletter from '../components/Newsletter.jsx';

export default function StaticPage({ title }) {
  return (
    <>
      <section className="static-page content-section">
        <p className="eyebrow">DREAM KRAFT LUNGIS</p>
        <h1>{title}</h1>
        <p>DREAM KRAFT LUNGIS blends traditional Indian textile sensibility with a modern shopping experience for premium cotton lungis and men's traditional wear.</p>
        <p>For support, shipping, returns, wholesale enquiries or store partnerships, contact care@dreamkraftlungis.in or call +91 98765 43210.</p>
      </section>
      <Newsletter />
    </>
  );
}
