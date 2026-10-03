import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Package,
  ShieldCheck,
  Tag,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'dkl_notifications';

const defaultNotifications = [
  {
    id: 1,
    type: 'order',
    title: 'Order Confirmed',
    message:
      'Your order has been placed successfully.',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    type: 'offer',
    title: 'Special Offer',
    message:
      'Enjoy special offers on selected DREAM KRAFT LUNGIS.',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    type: 'security',
    title: 'Account Security',
    message:
      'Your account information is protected securely.',
    read: true,
    createdAt: new Date().toISOString()
  }
];


/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

function loadNotifications() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      'Failed to load notifications:',
      error
    );
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(defaultNotifications)
  );

  return defaultNotifications;
}


/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({ type }) {
  if (type === 'order') {
    return <Package size={22} />;
  }

  if (type === 'offer') {
    return <Tag size={22} />;
  }

  if (type === 'security') {
    return <ShieldCheck size={22} />;
  }

  return <Bell size={22} />;
}


/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

export default function Notifications() {

  const [notifications, setNotifications] =
    useState(loadNotifications);


  /* =====================================================
     SAVE + UPDATE HEADER
  ===================================================== */

  const saveNotifications = (updatedNotifications) => {
    setNotifications(updatedNotifications);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new Event('notificationsUpdated')
    );
  };


  /* =====================================================
     UNREAD COUNT
  ===================================================== */

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        notification.read !== true
    ).length;
  }, [notifications]);


  /* =====================================================
     MARK ONE AS READ
  ===================================================== */

  const markAsRead = (id) => {
    const updatedNotifications =
      notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true
            }
          : notification
      );

    saveNotifications(updatedNotifications);
  };


  /* =====================================================
     MARK ALL AS READ
  ===================================================== */

  const markAllAsRead = () => {
    const updatedNotifications =
      notifications.map((notification) => ({
        ...notification,
        read: true
      }));

    saveNotifications(updatedNotifications);
  };


  /* =====================================================
     CLEAR ALL
  ===================================================== */

  const clearAll = () => {
    saveNotifications([]);
  };


  /* =====================================================
     KEEP HEADER UPDATED
  ===================================================== */

  useEffect(() => {
    window.dispatchEvent(
      new Event('notificationsUpdated')
    );
  }, []);


  return (
    <section className="notifications-page content-section">
      <div className="container notifications-container">

        {/* BACK */}
        <Link
          to="/account"
          className="notifications-back"
        >
          <ArrowLeft size={17} />
          Back to Account
        </Link>


        {/* HEADER */}
        <div className="notifications-header">

          <div className="notification-header-info">

            <div className="notification-header-icon">
              <Bell size={28} />
            </div>

            <div>
              <p className="eyebrow">
                DREAM KRAFT LUNGIS
              </p>

              <h1>
                Notifications
              </h1>

              <p>
                Stay updated with your orders,
                offers and account activity.
              </p>
            </div>

          </div>


          {/* UNREAD BADGE */}
          <div className="notification-header-badge">
            <span>
              {unreadCount}
            </span>

            <small>
              Unread
            </small>
          </div>

        </div>


        {/* ACTIONS */}
        {notifications.length > 0 && (
          <div className="notifications-actions">

            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={markAllAsRead}
              >
                <CheckCircle size={17} />
                Mark All as Read
              </button>
            )}

            <button
              type="button"
              className="notifications-clear-button"
              onClick={clearAll}
            >
              <Trash2 size={17} />
              Clear All
            </button>

          </div>
        )}


        {/* EMPTY STATE */}
        {notifications.length === 0 ? (

          <div className="notifications-empty">

            <div className="notifications-empty-icon">
              <Bell size={42} />
            </div>

            <h2>
              No Notifications
            </h2>

            <p>
              You're all caught up. New updates
              will appear here.
            </p>

            <Link
              to="/shop"
              className="btn btn-primary"
            >
              SHOP NOW
            </Link>

          </div>

        ) : (

          /* NOTIFICATION LIST */
          <div className="notifications-list">

            {notifications.map((notification) => (

              <article
                key={notification.id}
                className={`notification-card ${
                  notification.read
                    ? 'is-read'
                    : 'is-unread'
                }`}
                onClick={() =>
                  markAsRead(notification.id)
                }
              >

                {/* ICON */}
                <div
                  className={`notification-icon notification-icon-${notification.type}`}
                >
                  <NotificationIcon
                    type={notification.type}
                  />
                </div>


                {/* CONTENT */}
                <div className="notification-content">

                  <div className="notification-title-row">

                    <h3>
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="notification-unread-dot"></span>
                    )}

                  </div>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {formatNotificationDate(
                      notification.createdAt
                    )}
                  </small>

                </div>


                {/* READ STATUS */}
                {!notification.read && (
                  <button
                    type="button"
                    className="notification-read-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    aria-label={`Mark ${notification.title} as read`}
                    title="Mark as read"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}

              </article>

            ))}

          </div>

        )}

      </div>
    </section>
  );
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatNotificationDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}