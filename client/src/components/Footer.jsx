import React from 'react';
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-grid">

        {/* BRAND */}
        <section>
          <h2>DREAM KRAFT LUNGIS</h2>

          <p>Comfort Woven in Tradition.</p>

          <div className="social-row">
            <a
              aria-label="Instagram"
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={19} />
            </a>

            <a
              aria-label="Facebook"
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook size={19} />
            </a>

            <a
              aria-label="Twitter"
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Twitter size={19} />
            </a>
          </div>
        </section>

        {/* QUICK LINKS */}
        <section>
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/best-sellers">Best Sellers</Link>
          <Link to="/offers">Offers</Link>
        </section>

        {/* CUSTOMER SUPPORT */}
        <section>
          <h3>Customer Support</h3>

          <Link to="/account">My Account</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">My Wishlist</Link>
          <Link to="/saved-addresses">Saved Addresses</Link>
          <Link to="/change-password">Change Password</Link>
          <Link to="/contact">FAQ &amp; Support</Link>
        </section>

        {/* SELLER */}
        <section>
          <h3>Sell With Us</h3>

          <Link to="/seller/register">
            Become a Seller
          </Link>

          <Link to="/seller">
            Seller Dashboard
          </Link>

          <Link to="/contact">
            Seller Support
          </Link>
        </section>

        {/* CONTACT */}
        <section>
          <h3>Contact Us</h3>

          <p>
            <Phone size={16} />

            <a href="tel:+919876543210">
              +91 98765 43210
            </a>
          </p>

          <p>
            <Mail size={16} />

            <a href="mailto:care@dreamkraftlungis.in">
              care@dreamkraftlungis.in
            </a>
          </p>

          <p>
            <MapPin size={16} />

            <span>Tamil Nadu, India</span>
          </p>
        </section>

      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} DREAM KRAFT LUNGIS.
          All rights reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

      </div>

    </footer>
  );
}