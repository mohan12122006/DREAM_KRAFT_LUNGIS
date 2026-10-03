import React from 'react';
import { useEffect, useState } from 'react';
import CategoryCard from '../components/CategoryCard.jsx';
import Hero from '../components/Hero.jsx';
import Newsletter from '../components/Newsletter.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';

export default function Home() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProducts('?featured=true&limit=8'), api.getCategories()])
      .then(([products, categories]) => setData({ products: products.items, categories }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <section className="content-section">
        <SectionHeader eyebrow="Shop by tradition" title="Curated Lungi Collections">
          Soft cotton comfort, premium borders, daily checks, and festive staples.
        </SectionHeader>
        {loading ? <Loading /> : <div className="category-grid">{data.categories.map(category => <CategoryCard key={category.id} category={category} />)}</div>}
      </section>
      <section className="offers-band">
        <p>TRADITIONAL COMFORT. SPECIAL PRICES.</p>
        <h2>Up to 30% OFF, festival offers and free delivery on selected orders.</h2>
        <a className="btn btn-primary" href="/offers">SHOP OFFERS</a>
      </section>
      <section className="content-section">
        <SectionHeader eyebrow="Customer favourites" title="Featured Products" />
        {loading ? <Loading /> : <div className="product-grid">{data.products.map(product => <ProductCard key={product.id} product={product} />)}</div>}
      </section>
      <section className="features content-section">
        {[
          ['100% Cotton', 'Soft and breathable cotton fabric.'],
          ['Premium Quality', 'Quality materials and comfortable designs.'],
          ['Fast Delivery', 'Reliable doorstep delivery.'],
          ['Secure Shopping', 'Safe and convenient online shopping.']
        ].map(([title, text]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
      </section>
      <section className="reviews content-section">
        <SectionHeader eyebrow="Customer reviews" title="Trusted for Everyday Comfort" />
        <div className="review-grid">
          {[
            ['Arun Kumar', 'Excellent quality and very comfortable for everyday use.', 'Aug 2026'],
            ['S. Rajesh', 'The cotton feels soft and the border finish looks premium.', 'Jul 2026'],
            ['Mohan Das', 'Fast delivery and the checked lungi colour was exactly as shown.', 'Jul 2026']
          ].map(([name, text, date]) => (
            <article className="review-card" key={name}>
              <div className="avatar" aria-hidden="true">{name[0]}</div>
              <strong>{name}</strong><span>★★★★★</span><p>{text}</p><small>{date}</small>
            </article>
          ))}
        </div>
      </section>
      <Newsletter />
    </>
  );
}
