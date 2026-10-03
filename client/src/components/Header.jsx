import React, { useEffect, useState } from 'react';

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  Bell,
  X,
} from 'lucide-react';

import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  ['Home', '/'],
  ['Shop', '/shop'],
  ['Categories', '/categories'],
  ['New Arrivals', '/new-arrivals'],
  ['Best Sellers', '/best-sellers'],
  ['Offers', '/offers'],
  ['About Us', '/about'],
  ['Contact', '/contact'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  const { cartCount, wishlistCount } = useCart();
  const { user } = useAuth();

  const navigate = useNavigate();

  /* =====================================================
     NOTIFICATION COUNT
  ===================================================== */

  useEffect(() => {
    const updateNotificationCount = () => {
      try {
        const savedNotifications =
          localStorage.getItem('dkl_notifications');

        if (!savedNotifications) {
          setNotificationCount(0);
          return;
        }

        const notifications =
          JSON.parse(savedNotifications);

        if (!Array.isArray(notifications)) {
          setNotificationCount(0);
          return;
        }

        const unreadCount = notifications.filter(
          (notification) => notification.read !== true
        ).length;

        setNotificationCount(unreadCount);
      } catch (error) {
        console.error(
          'Error loading notification count:',
          error
        );

        setNotificationCount(0);
      }
    };

    updateNotificationCount();

    window.addEventListener(
      'notificationsUpdated',
      updateNotificationCount
    );

    window.addEventListener(
      'storage',
      updateNotificationCount
    );

    return () => {
      window.removeEventListener(
        'notificationsUpdated',
        updateNotificationCount
      );

      window.removeEventListener(
        'storage',
        updateNotificationCount
      );
    };
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const submitSearch = (event) => {
    event.preventDefault();

    const value = query.trim();

    if (!value) {
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(value)}`
    );

    setSearchOpen(false);
    setOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <header className="site-header">

      {/* LOGO */}

      <Link
        className="brand"
        to="/"
        onClick={() => setOpen(false)}
      >
        <img
          className="brand-logo"
          src="/images/logo.png"
          alt="DREAM KRAFT LUNGIS"
        />
      </Link>


      {/* MOBILE MENU BUTTON */}

      <button
        className="icon-button mobile-menu-button"
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>


      {/* NAVIGATION */}

      <nav
        className={`main-nav ${open ? 'is-open' : ''}`}
        aria-label="Primary navigation"
      >

        <button
          className="icon-button mobile-close"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        >
          <X size={22} />
        </button>

        {links.map(([label, href]) => (
          <NavLink
            key={href}
            to={href}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}

      </nav>


      {/* HEADER ACTIONS */}

      <div className="header-actions">

        {/* SEARCH */}
{searchOpen ? (
  <form
    className="navbar-search-popup"
    onSubmit={submitSearch}
  >
    <Search size={19} />

    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search products..."
      autoFocus
      aria-label="Search products"
    />

    <button
      type="button"
      onClick={() => {
        setSearchOpen(false);
        setQuery('');
      }}
      aria-label="Close search"
    >
      <X size={18} />
    </button>
  </form>
) : (
  <button
    type="button"
    className="icon-button"
    onClick={() => setSearchOpen(true)}
    aria-label="Search"
  >
    <Search size={20} />
  </button>
)}


        {/* NOTIFICATIONS */}

        <Link
          to="/notifications"
          className="icon-button notification-header-button"
          aria-label={
            notificationCount > 0
              ? `${notificationCount} unread notifications`
              : 'Notifications'
          }
          title="Notifications"
        >
          <Bell size={20} />

          {notificationCount > 0 && (
            <span className="notification-header-badge">
              {notificationCount > 99
                ? '99+'
                : notificationCount}
            </span>
          )}
        </Link>


        {/* WISHLIST */}

        <Link
          to="/wishlist"
          className="icon-button badge-button"
          aria-label={`Wishlist with ${wishlistCount} items`}
          title="Wishlist"
        >
          <Heart size={20} />

          {wishlistCount > 0 && (
            <span>{wishlistCount}</span>
          )}
        </Link>


        {/* ACCOUNT */}

        <Link
          to={user ? '/account' : '/login'}
          className={`icon-button account-header-button ${
            user ? 'is-logged-in' : ''
          }`}
          aria-label={user ? 'My Account' : 'Login'}
          title={user ? 'My Account' : 'Login'}
        >
          <User size={20} />

          {user && (
            <span className="login-status-dot"></span>
          )}
        </Link>


        {/* CART */}

        <Link
          to="/cart"
          className="icon-button badge-button"
          aria-label={`Shopping cart with ${cartCount} items`}
          title="Shopping Cart"
        >
          <ShoppingBag size={20} />

          {cartCount > 0 && (
            <span>{cartCount}</span>
          )}
        </Link>

      </div>

    </header>
  );
}