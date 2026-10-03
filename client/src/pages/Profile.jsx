import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Edit3,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);

  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-login">
          <User size={40} />
          <h2>Login Required</h2>
          <p>Please login to view your profile.</p>

          <Link to="/login" className="profile-button">
            LOGIN
          </Link>
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Connect this later to your profile update API
    setEditing(false);

    showToast('Profile updated successfully');
  };

  return (
    <main className="profile-page">

      <div className="profile-container">

        {/* BACK */}
        <Link to="/account" className="profile-back">
          <ArrowLeft size={18} />
          Back to Account
        </Link>

        {/* HEADER */}
        <div className="profile-heading">

          <div className="profile-avatar">
            <User size={38} />
          </div>

          <div>
            <p className="profile-eyebrow">
              DREAM KRAFT LUNGIS
            </p>

            <h1>My Profile</h1>

            <p>
              Manage your personal information
            </p>
          </div>

        </div>


        {/* PROFILE CARD */}
        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <h2>Personal Information</h2>

              <p>
                Your account details
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => setEditing(true)}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}

          </div>


          <form onSubmit={handleSave}>

            {/* NAME */}
            <div className="profile-field">

              <label>
                <User size={17} />
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your name"
              />

            </div>


            {/* EMAIL */}
            <div className="profile-field">

              <label>
                <Mail size={17} />
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={values.email}
                disabled
              />

              <small>
                Email address cannot be changed here.
              </small>

            </div>


            {/* PHONE */}
            <div className="profile-field">

              <label>
                <Phone size={17} />
                Mobile Number
              </label>

              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your mobile number"
              />

            </div>


            {/* ADDRESS */}
            <div className="profile-field">

              <label>
                <MapPin size={17} />
                Delivery Address
              </label>

              <Link
                to="/saved-addresses"
                className="profile-address-link"
              >
                Manage your saved delivery address
              </Link>

            </div>
            
            {/* SAVE */}
            {editing && (
              <div className="profile-actions">

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => {
                    setEditing(false);

                    setValues({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || ''
                    });
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="profile-save-btn"
                >
                  <Save size={17} />
                  SAVE CHANGES
                </button>

              </div>
            )}

          </form>

        </section>


        {/* ACCOUNT INFORMATION */}
        <section className="profile-info-grid">

          <Link to="/orders" className="profile-info-card">
            <h3>My Orders</h3>
            <p>
              View and track your previous orders.
            </p>
          </Link>

          <Link to="/wishlist" className="profile-info-card">
            <h3>My Wishlist</h3>
            <p>
              View your saved favourite lungis.
            </p>
          </Link>

          <Link to="/cart" className="profile-info-card">
            <h3>Shopping Cart</h3>
            <p>
              Continue shopping and checkout.
            </p>
          </Link>

        </section>

      </div>

    </main>
  );
}