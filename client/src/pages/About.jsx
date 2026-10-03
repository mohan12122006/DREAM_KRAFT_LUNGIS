// client/src/pages/About.jsx

import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Newsletter from '../components/Newsletter.jsx';

export default function About() {
  const values = [
    {
      title: 'Premium Cotton',
      text: 'Comfortable cotton fabrics selected for softness, breathability and everyday wear.'
    },
    {
      title: 'Traditional Craft',
      text: 'Inspired by the timeless Indian lungi and its place in everyday tradition.'
    },
    {
      title: 'Made for Comfort',
      text: 'Relaxed designs made to keep you comfortable throughout the day.'
    },
    {
      title: 'Quality First',
      text: 'We focus on dependable materials, neat finishing and lasting value.'
    }
  ];

  const collection = [
    {
      title: 'Cotton Lungis',
      image: '/images/categories/category-cotton-lungis.jpg',
      link: '/shop'
    },
    {
      title: 'Premium Lungis',
      image: '/images/categories/category-premium-lungis.jpg',
      link: '/shop'
    },
    {
      title: 'Checked Lungis',
      image: '/images/categories/category-checked-lungis.jpg',
      link: '/shop'
    },
    {
      title: 'Plain Lungis',
      image: '/images/categories/category-plain-lungis.jpg',
      link: '/shop'
    }
  ];

  return (
    <>
      {/* ABOUT HERO
      <section className="about-hero">
        <div className="about-hero-image">
          <img
            src="/images/hero.jpg"
            alt="DREAM KRAFT LUNGIS"
          />
        </div>

        <div className="about-hero-overlay">
          <div className="about-hero-content">
            <p className="eyebrow">DREAM KRAFT LUNGIS</p>

            <h1>
              WOVEN WITH
              <br />
              TRADITION
            </h1>

            <p>
              Premium cotton lungis bringing together timeless
              Indian tradition, everyday comfort and modern style.
            </p>

            <Link to="/shop" className="btn btn-primary">
              EXPLORE COLLECTION
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section> */}

      {/* OUR STORY */}
      <section className="about-story content-section">
        <div className="about-story-image">
          <img
            src="/images/products/white-lungi-1.jpg"
            alt="Traditional DREAM KRAFT LUNGI"
          />
        </div>

        <div className="about-story-content">
          <p className="eyebrow">OUR STORY</p>

          <h2>
            Tradition that feels
            <br />
            <span>at home.</span>
          </h2>

          <p>
            DREAM KRAFT LUNGIS is built around a simple idea:
            traditional clothing should feel as comfortable today
            as it has for generations.
          </p>

          <p>
            Our collection focuses on premium cotton lungis designed
            for everyday life. From classic checks and traditional
            whites to refined colours and premium borders, every
            style is selected with comfort and simplicity in mind.
          </p>

          <div className="about-points">
            <div>
              <CheckCircle2 size={20} />
              <span>Premium cotton fabrics</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Traditional Indian designs</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Comfort for everyday wear</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Quality-focused collection</span>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values content-section">
        <div className="section-heading">
          <p className="eyebrow">WHAT WE BELIEVE</p>

          <h2>
            Made for everyday
            <br />
            <span>comfort.</span>
          </h2>

          <p>
            We combine traditional textile inspiration with a
            clean, modern shopping experience.
          </p>
        </div>

        <div className="about-values-grid">
          {values.map((value) => (
            <article className="about-value-card" key={value.title}>
              <div className="about-value-number">
                0{values.indexOf(value) + 1}
              </div>

              <h3>{value.title}</h3>

              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* COLLECTION */}
      <section className="about-collection content-section">
        <div className="section-heading">
          <p className="eyebrow">OUR COLLECTION</p>

          <h2>
            Discover the
            <br />
            <span>DREAM KRAFT collection.</span>
          </h2>
        </div>

        <div className="about-collection-grid">
          {collection.map((item) => (
            <Link
              to={item.link}
              className="about-collection-card"
              key={item.title}
            >
              <div className="about-collection-image">
                <img
                  src={item.image}
                  alt={item.title}
                />
              </div>

              <div className="about-collection-info">
                <h3>{item.title}</h3>

                <span>
                  SHOP NOW <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-content">
          <p className="eyebrow">DREAM KRAFT LUNGIS</p>

          <h2>
            Comfort woven
            <br />
            into tradition.
          </h2>

          <p>
            Find your everyday favourite from our collection
            of premium cotton lungis.
          </p>

          <Link to="/shop" className="btn btn-primary">
            SHOP LUNGIS
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />

      {/* PAGE STYLES */}
      <style>{`
        // .about-hero {
        //   position: relative;
        //   min-height: 560px;
        //   overflow: hidden;
        //   background: #111;
        // }

        // .about-hero-image {
        //   position: absolute;
        //   inset: 0;
        // }

        // .about-hero-image img {
        //   width: 100%;
        //   height: 100%;
        //   object-fit: cover;
        //   display: block;
        // }

        // .about-hero-overlay {
        //   position: relative;
        //   z-index: 2;
        //   min-height: 560px;
        //   display: flex;
        //   align-items: center;
        //   padding: 70px 7%;
        //   background: linear-gradient(
        //     90deg,
        //     rgba(0, 0, 0, .72) 0%,
        //     rgba(0, 0, 0, .42) 45%,
        //     rgba(0, 0, 0, .05) 100%
        //   );
        // }

        // .about-hero-content {
        //   max-width: 620px;
        //   color: #fff;
        // }

        // .about-hero-content .eyebrow {
        //   color: #fff;
        // }

        // .about-hero-content h1 {
        //   margin: 12px 0 20px;
        //   font-size: clamp(42px, 6vw, 76px);
        //   line-height: .98;
        //   letter-spacing: -.04em;
        // }

        // .about-hero-content > p:not(.eyebrow) {
        //   max-width: 520px;
        //   margin-bottom: 30px;
        //   font-size: 17px;
        //   line-height: 1.7;
        // }

        .about-story {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          align-items: center;
        }

        .about-story-image {
          overflow: hidden;
          aspect-ratio: 2/ 2;
          background: #f3f1ed;
          border-radius: 20px;
        }

        .about-story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .about-story-content h2,
        .section-heading h2 {
          margin: 10px 0 20px;
          font-size: clamp(36px, 4.5vw, 58px);
          line-height: 1.05;
          letter-spacing: -.035em;
        }

        .about-story-content h2 span,
        .section-heading h2 span {
          font-style: italic;
          font-weight: 400;
        }

        .about-story-content > p {
          max-width: 600px;
          line-height: 1.8;
          margin-bottom: 16px;
        }

        .about-points {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 28px;
        }

        .about-points div {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .about-points svg {
          flex-shrink: 0;
        }

        .section-heading {
          max-width: 700px;
          margin-bottom: 45px;
        }

        .section-heading > p:last-child {
          max-width: 570px;
          line-height: 1.7;
        }

        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .about-value-card {
          padding: 32px 26px;
          border: 1px solid #e7e3dd;
          background: #fff;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .about-value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 35px rgba(0, 0, 0, .08);
        }

        .about-value-number {
          font-size: 13px;
          letter-spacing: .12em;
          margin-bottom: 42px;
          opacity: .55;
        }

        .about-value-card h3 {
          margin-bottom: 12px;
          font-size: 21px;
        }

        .about-value-card p {
          margin: 0;
          line-height: 1.7;
          font-size: 14px;
          opacity: .72;
        }

        .about-collection {
          background: #f7f5f1;
        }

        .about-collection-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .about-collection-card {
          color: inherit;
          text-decoration: none;
          display: block;
        }

        .about-collection-image {
          overflow: hidden;
          aspect-ratio: 3 / 4;
          background: #eee;
        }

        .about-collection-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }

        .about-collection-card:hover img {
          transform: scale(1.04);
        }

        .about-collection-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 18px 0;
        }

        .about-collection-info h3 {
          margin: 0;
          font-size: 18px;
        }

        .about-collection-info span {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .about-cta {
          padding: 100px 7%;
          background: #151515;
          color: #fff;
          text-align: center;
        }

        .about-cta-content {
          max-width: 700px;
          margin: auto;
        }

        .about-cta .eyebrow {
          color: #fff;
        }

        .about-cta h2 {
          margin: 12px 0 20px;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1;
          letter-spacing: -.04em;
        }

        .about-cta p:not(.eyebrow) {
          max-width: 520px;
          margin: 0 auto 30px;
          line-height: 1.7;
          opacity: .78;
        }

        @media (max-width: 900px) {
          .about-story {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-values-grid {
            grid-template-columns: 1fr 1fr;
          }

          .about-collection-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .about-hero,
          .about-hero-overlay {
            min-height: 520px;
          }

          .about-hero-overlay {
            padding: 50px 22px;
          }

          .about-story {
            gap: 30px;
          }

          .about-points {
            grid-template-columns: 1fr;
          }

          .about-values-grid,
          .about-collection-grid {
            grid-template-columns: 1fr;
          }

          .about-value-card {
            padding: 26px 22px;
          }

          .about-cta {
            padding: 75px 22px;
          }
        }
      `}</style>
    </>
  );
}