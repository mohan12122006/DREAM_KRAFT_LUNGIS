import React from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Truck,
  Gift,
  ShoppingBag,
  Percent
} from 'lucide-react';

export default function Offers() {
  return (
    <main className="offers-page">

      {/* HERO */}
      <section className="offers-hero">
        <div className="offers-hero-content">

          <span className="offers-eyebrow">
            DREAM KRAFT LUNGIS
          </span>

          <h1>
            TRADITIONAL COMFORT.
            <br />
            SPECIAL PRICES.
          </h1>

          <p>
            Discover special offers on premium cotton lungis
            made for everyday comfort.
          </p>

          <Link
            to="/shop?filter=offers"
            className="offers-primary-btn"
          >
            <ShoppingBag size={18} />
            SHOP OFFERS
          </Link>

        </div>
      </section>


      {/* OFFER CARDS */}
      <section className="offers-section">

        <div className="offers-heading">
          <p className="eyebrow">
            SPECIAL DEALS
          </p>

          <h2>
            Offers Made for You
          </h2>

          <p>
            Enjoy great value on selected DREAM KRAFT LUNGIS
            collections.
          </p>
        </div>


        <div className="offers-grid">

          {/* OFFER 1 */}
          <article className="offer-card">

            <div className="offer-icon">
              <Percent size={28} />
            </div>

            <span className="offer-label">
              LIMITED OFFER
            </span>

            <h3>
              Up to 30% OFF
            </h3>

            <p>
              Save more on selected premium cotton lungis.
            </p>

            <Link to="/shop?filter=offers">
              Shop Now →
            </Link>

          </article>


          {/* OFFER 2 */}
          <article className="offer-card">

            <div className="offer-icon">
              <Truck size={28} />
            </div>

            <span className="offer-label">
              DELIVERY OFFER
            </span>

            <h3>
              Free Delivery
            </h3>

            <p>
              Enjoy free delivery on selected qualifying
              orders.
            </p>

            <Link to="/shop">
              Shop Now →
            </Link>

          </article>


          {/* OFFER 3 */}
          <article className="offer-card">

            <div className="offer-icon">
              <Gift size={28} />
            </div>

            <span className="offer-label">
              SPECIAL DEAL
            </span>

            <h3>
              Festival Offers
            </h3>

            <p>
              Explore special prices during festive
              collections.
            </p>

            <Link to="/shop?filter=offers">
              Explore →
            </Link>

          </article>


          {/* OFFER 4 */}
          <article className="offer-card">

            <div className="offer-icon">
              <Tag size={28} />
            </div>

            <span className="offer-label">
              NEW COLLECTION
            </span>

            <h3>
              New Collection Offers
            </h3>

            <p>
              Discover new traditional styles at special
              introductory prices.
            </p>

            <Link to="/new-arrivals">
              View Collection →
            </Link>

          </article>

        </div>
      </section>


      {/* COUPON BANNER */}
      <section className="coupon-banner">

        <div className="coupon-icon">
          <Tag size={30} />
        </div>

        <div className="coupon-content">

          <span>
            SPECIAL SAVINGS
          </span>

          <h2>
            SAVE MORE ON YOUR ORDER
          </h2>

          <p>
            Apply available coupon codes at checkout and
            enjoy additional savings.
          </p>

        </div>

        <Link
          to="/shop"
          className="coupon-button"
        >
          SHOP NOW
        </Link>

      </section>


      {/* BOTTOM CTA */}
      <section className="offers-bottom">

        <p className="eyebrow">
          DREAM KRAFT LUNGIS
        </p>

        <h2>
          Comfort Woven in Tradition
        </h2>

        <p>
          Find your favourite cotton lungi and enjoy
          comfortable traditional wear every day.
        </p>

        <Link
          to="/shop"
          className="offers-primary-btn"
        >
          <ShoppingBag size={18} />
          EXPLORE COLLECTION
        </Link>

      </section>

    </main>
  );
}