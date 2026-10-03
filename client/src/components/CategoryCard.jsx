import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <article className="category-card">
      <img src={category.imageUrl} alt={category.name} loading="lazy" />
      <div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <Link className="btn btn-small" to={`/shop?category=${category.slug}`}>SHOP NOW</Link>
      </div>
    </article>
  );
}
