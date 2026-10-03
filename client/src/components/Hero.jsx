import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">Premium Indian Cotton Lungis</p>
       <h1>
  COMFORT WOVEN
  <br />
  <em>IN TRADITION</em>
</h1>
        <p>Discover Premium Cotton Lungis Designed for Everyday Comfort.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/shop">SHOP NOW <ArrowRight size={18} /></Link>
          <Link className="btn btn-secondary" to="/categories">EXPLORE COLLECTION</Link>
        </div>
      </div>
    </section>
  );
}
