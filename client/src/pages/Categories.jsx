import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Crown,
  Grid3X3,
  Shirt,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

import "../styles/categories.css";

const categories = [
  {
    title: "Cotton Lungis",
    description: "Soft and comfortable cotton lungis for everyday wear.",
    image: "/images/categories/category-cotton-lungis.jpg",
    icon: Shirt,
    link: "/shop",
  },
  {
    title: "Premium Lungis",
    description: "Premium quality lungis designed for superior comfort.",
    image: "/images/categories/category-premium-lungis.jpg",
    icon: Crown,
    link: "/shop",
  },
  {
    title: "Checked Lungis",
    description: "Classic checked patterns with comfortable cotton fabric.",
    image: "/images/categories/category-checked-lungis.jpg",
    icon: Grid3X3,
    link: "/shop",
  },
  {
    title: "Plain Lungis",
    description: "Simple and stylish plain lungis for everyday comfort.",
    image: "/images/categories/category-plain-lungis.jpg",
    icon: Shirt,
    link: "/shop",
  },
  {
    title: "Traditional Collection",
    description: "Traditional South Indian styles woven with comfort.",
    image: "/images/categories/category-traditional.jpg",
    icon: Crown,
    link: "/shop",
  },
  {
    title: "New Arrivals",
    description: "Discover our latest lungi designs and collections.",
    image: "/images/categories/category-new-arrivals.jpg",
    icon: Sparkles,
    link: "/new-arrivals",
  },
  {
    title: "Best Sellers",
    description: "Explore popular lungis from DREAM KRAFT LUNGIS.",
    image: "/images/categories/category-best-sellers.jpg",
    icon: Star,
    link: "/best-sellers",
  },
  {
    title: "Festival Collection",
    description: "Special collections perfect for festive occasions.",
    image: "/images/categories/category-festival.jpg",
    icon: Tag,
    link: "/shop",
  },
];

export default function Categories() {
  return (
    <main className="categories-page">
      {/* ================= HERO ================= */}
      <section className="categories-hero">
        <div className="categories-hero-overlay"></div>

        <div className="categories-hero-content">
          <span className="categories-eyebrow">DREAM KRAFT LUNGIS</span>

          <div className="hero-small-text">
            TRADITION&nbsp;&nbsp; • &nbsp;&nbsp;COMFORT&nbsp;&nbsp; •
            &nbsp;&nbsp;QUALITY
          </div>

          <h1>
            COMFORT WOVEN
            <span>IN TRADITION</span>
          </h1>

          <p>
            Premium Indian cotton lungis made for everyday comfort and timeless
            style.
          </p>

          <Link to="/shop" className="categories-hero-btn">
            SHOP COLLECTION
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ================= COLLECTIONS ================= */}
      <section className="categories-section">
        <div className="categories-heading">
          <span>SHOP BY COLLECTION</span>

          <h2>Find Your Perfect Lungi</h2>

          <p>
            Explore our carefully selected collections of comfortable and
            stylish lungis.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <article className="category-card" key={category.title}>
                <div className="category-image">
                  <img src={category.image} alt={category.title} />

                  <div className="category-overlay"></div>

                  <div className="category-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="category-icon">
                    <Icon size={21} />
                  </div>
                </div>

                <div className="category-content">
                  <h3>{category.title}</h3>

                  <p>{category.description}</p>

                  <Link to={category.link} className="category-link">
                    View Collection
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="categories-cta">
        <div className="categories-cta-content">
          <span>COMFORT • TRADITION • QUALITY</span>

          <h2>WOVEN FOR EVERYDAY COMFORT</h2>

          <p>Experience the comfort of premium Indian cotton lungis.</p>

          <Link to="/shop" className="categories-cta-btn">
            Shop Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
