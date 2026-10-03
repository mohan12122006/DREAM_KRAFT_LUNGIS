import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  ShieldCheck,
  Heart,
  ShoppingBag,
  MapPin,
  Truck,
  Tag,
  Bell,
  LockKeyhole,
  LogOut,
  ChevronRight,
  Store,
  Settings
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';


export default function Account() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const cartContext = useCart();

  const cartCount = cartContext?.cartCount || 0;
  const wishlistCount = cartContext?.wishlistCount || 0;


  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!user) {
    return (
      <main className="account-page">

        <section className="content-section">

          <div className="empty-state">

            <div
              style={{
                width: 70,
                height: 70,
                margin: '0 auto 20px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: '#f4ead7',
                color: '#7d1f1f'
              }}
            >
              <User size={34} />
            </div>

            <h1>Login Required</h1>

            <p>
              Please login to view your account,
              orders, wishlist and saved addresses.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              LOGIN
            </button>

          </div>

        </section>

      </main>
    );
  }


  /* =====================================================
     USER DETAILS
  ===================================================== */

  const userName =
    user.name ||
    user.fullName ||
    'Dream Kraft Customer';

  const userEmail =
    user.email ||
    '';

  const initial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || 'D';

  const role =
    String(user.role || 'customer').toLowerCase();


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    navigate('/');
  };


  /* =====================================================
     ACCOUNT MENU
  ===================================================== */

  const accountItems = [

    /* ================= ADMIN ================= */

    ...(role === 'admin'
      ? [
          {
            icon: ShieldCheck,
            title: 'Admin Panel',
            description:
              'Manage sellers and store administration',
            to: '/admin/sellers'
          }
        ]
      : []),


    /* ================= SELLER ================= */

    ...(role === 'seller'
      ? [
          {
            icon: Store,
            title: 'Seller Dashboard',
            description:
              'Manage your store, products and orders',
            to: '/seller'
          }
        ]
      : []),


    /* ================= COMMON ================= */

    {
      icon: User,
      title: 'My Profile',
      description:
        'View and edit your profile',
      to: '/profile'
    },

    {
      icon: Package,
      title: 'Orders',
      description:
        'View and track your orders',
      to: '/orders'
    },

    {
      icon: Heart,
      title: 'Wishlist',
      description:
        `${wishlistCount} saved ${
          wishlistCount === 1 ? 'item' : 'items'
        }`,
      to: '/wishlist'
    },

    {
      icon: ShoppingBag,
      title: 'My Cart',
      description:
        `${cartCount} ${
          cartCount === 1 ? 'item' : 'items'
        } in your cart`,
      to: '/cart'
    },

    {
      icon: MapPin,
      title: 'Saved Addresses',
      description:
        'Manage your delivery address',
      to: '/saved-addresses'
    },

  

    {
      icon: Tag,
      title: 'Offers',
      description:
        'View current offers and discounts',
      to: '/offers'
    },

    {
      icon: Bell,
      title: 'Notifications',
      description:
        'Manage your notifications',
      to: '/notifications'
    },

    {
      icon: LockKeyhole,
      title: 'Change Password',
      description:
        'Password and account security',
      to: '/change-password'
    }

  ];


  /* =====================================================
     SELLER / ADMIN ROLE BADGE
  ===================================================== */

  const roleLabel =
    role === 'admin'
      ? 'Administrator'
      : role === 'seller'
        ? 'Seller'
        : 'Customer';


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="account-page">

      <section className="content-section">

        {/* =================================================
           ACCOUNT HEADER
        ================================================= */}

        <div className="account-header">

          <div>

            <span className="eyebrow">
              DREAM KRAFT LUNGIS
            </span>

            <h1>
              My Account
            </h1>

            <p className="muted">
              Manage your profile, orders and
              shopping preferences.
            </p>

          </div>

          <button
            type="button"
            className="btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            LOGOUT
          </button>

        </div>


        {/* =================================================
           PROFILE CARD
        ================================================= */}

        <div
          className="dashboard-card"
          style={{
            marginBottom: '26px',
            padding: '28px'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >

            {/* Avatar */}

            <div
              style={{
                width: 76,
                height: 76,
                minWidth: 76,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: '#7d1f1f',
                color: '#fff',
                fontSize: '2rem',
                fontFamily: 'Georgia, serif',
                boxShadow:
                  '0 8px 20px rgba(80, 20, 20, 0.18)'
              }}
            >
              {initial}
            </div>


            {/* User information */}

            <div style={{ flex: 1 }}>

              <span className="eyebrow">
                {roleLabel}
              </span>

              <h2
                style={{
                  margin: '5px 0 6px',
                  fontFamily: 'Georgia, serif',
                  fontSize:
                    'clamp(1.7rem, 4vw, 2.7rem)',
                  color: '#3b291f'
                }}
              >
                Hello, {userName}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#716856'
                }}
              >
                {userEmail}
              </p>

            </div>


            {/* Profile button */}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate('/profile')
              }
            >
              <Settings size={17} />
              EDIT PROFILE
            </button>

          </div>

        </div>


        {/* =================================================
           ADMIN QUICK ACCESS
        ================================================= */}

        {role === 'admin' && (

          <div
            className="dashboard-card"
            style={{
              marginBottom: '26px',
              padding: '22px',
              borderColor: '#b1842f',
              background:
                'linear-gradient(135deg, #fffdf7, #f9efd9)'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >

                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    background: '#7d1f1f',
                    color: '#fff'
                  }}
                >
                  <ShieldCheck size={25} />
                </div>

                <div>

                  <strong
                    style={{
                      display: 'block',
                      fontSize: '1.05rem',
                      color: '#3b291f'
                    }}
                  >
                    Administrator Access
                  </strong>

                  <span
                    style={{
                      color: '#716856',
                      fontSize: '0.92rem'
                    }}
                  >
                    Manage sellers and store administration
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate('/admin/sellers')
                }
              >
                OPEN ADMIN PANEL
                <ChevronRight size={18} />
              </button>

            </div>

          </div>

        )}


        {/* =================================================
           SELLER QUICK ACCESS
        ================================================= */}

        {role === 'seller' && (

          <div
            className="dashboard-card"
            style={{
              marginBottom: '26px',
              padding: '22px',
              borderColor: '#b1842f',
              background:
                'linear-gradient(135deg, #fffdf7, #f9efd9)'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >

                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    background: '#7d1f1f',
                    color: '#fff'
                  }}
                >
                  <Store size={25} />
                </div>

                <div>

                  <strong
                    style={{
                      display: 'block',
                      fontSize: '1.05rem',
                      color: '#3b291f'
                    }}
                  >
                    Seller Account
                  </strong>

                  <span
                    style={{
                      color: '#716856',
                      fontSize: '0.92rem'
                    }}
                  >
                    Manage your products and orders
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate('/seller')
                }
              >
                SELLER DASHBOARD
                <ChevronRight size={18} />
              </button>

            </div>

          </div>

        )}


        {/* =================================================
           ACCOUNT OPTIONS
        ================================================= */}

        <div className="dashboard-card">

          <div
            style={{
              padding: '24px 28px',
              borderBottom:
                '1px solid var(--color-border)'
            }}
          >

            <h2
              style={{
                margin: 0,
                fontFamily: 'Georgia, serif'
              }}
            >
              Your Account
            </h2>

          </div>


          <div>

            {accountItems.map(
              (item, index) => {

                const Icon = item.icon;

                return (

                  <button
                    key={`${item.title}-${index}`}
                    type="button"
                    onClick={() =>
                      navigate(item.to)
                    }
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '18px 28px',
                      border: 0,
                      borderBottom:
                        '1px solid var(--color-border)',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'inherit'
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background =
                        '#fffaf0';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background =
                        'transparent';
                    }}
                  >

                    {/* Icon */}

                    <span
                      style={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 12,
                        background: '#f7f0e2',
                        color: '#604d35'
                      }}
                    >
                      <Icon size={21} />
                    </span>


                    {/* Text */}

                    <span
                      style={{
                        flex: 1,
                        minWidth: 0
                      }}
                    >

                      <strong
                        style={{
                          display: 'block',
                          marginBottom: 4,
                          fontSize: '1rem'
                        }}
                      >
                        {item.title}
                      </strong>

                      <small
                        style={{
                          display: 'block',
                          color: '#8a7d6d',
                          lineHeight: 1.4
                        }}
                      >
                        {item.description}
                      </small>

                    </span>


                    {/* Arrow */}

                    <ChevronRight
                      size={20}
                      style={{
                        color: '#a89a88',
                        flexShrink: 0
                      }}
                    />

                  </button>

                );

              }
            )}

          </div>

        </div>


        {/* =================================================
           LOGOUT
        ================================================= */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 28
          }}
        >

          <button
            type="button"
            className="btn"
            onClick={handleLogout}
            style={{
              color: '#7d1f1f'
            }}
          >
            <LogOut size={18} />
            LOGOUT FROM ACCOUNT
          </button>

        </div>


        {/* =================================================
           BRAND FOOTER TEXT
        ================================================= */}

        <div
          style={{
            textAlign: 'center',
            marginTop: 42,
            color: '#8a7d6d'
          }}
        >

          <strong
            style={{
              color: '#7d1f1f',
              letterSpacing: '0.08em'
            }}
          >
            DREAM KRAFT LUNGIS
          </strong>

          <p
            style={{
              marginTop: 6
            }}
          >
            Comfort Woven in Tradition
          </p>

        </div>

      </section>

    </main>
  );
}