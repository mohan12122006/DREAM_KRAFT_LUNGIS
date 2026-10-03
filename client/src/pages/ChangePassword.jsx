import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (values.newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (values.currentPassword === values.newPassword) {
      showToast('New password must be different from the current password.', 'error');
      return;
    }

    try {
      setLoading(true);

     await api.changePassword({
  currentPassword: values.currentPassword,
  newPassword: values.newPassword
});

      showToast('Password changed successfully.', 'success');

      setValues({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        navigate('/account');
      }, 700);

    } catch (error) {
      showToast(error.message || 'Unable to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="change-password-page">
      <div className="change-password-card">

        <Link to="/account" className="change-password-back">
          <ArrowLeft size={17} />
          Back to Account
        </Link>

        <div className="change-password-icon">
          <Lock size={28} />
        </div>

        <h1>Change Password</h1>

        <p className="change-password-description">
          Update your password to keep your DREAM KRAFT LUNGIS account secure.
        </p>

        <form onSubmit={submit}>

          <div className="password-field">
            <label htmlFor="currentPassword">
              Current Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={values.currentPassword}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label="Show or hide current password"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="password-field">
            <label htmlFor="newPassword">
              New Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="newPassword"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={values.newPassword}
                onChange={handleChange}
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowNew(!showNew)}
                aria-label="Show or hide new password"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <small>
              Password must contain at least 8 characters.
            </small>
          </div>

          <div className="password-field">
            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={values.confirmPassword}
                onChange={handleChange}
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Show or hide confirmed password"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="change-password-button"
            disabled={loading}
          >
            {loading ? 'CHANGING PASSWORD...' : 'CHANGE PASSWORD'}
          </button>

        </form>

        <p className="change-password-security">
          Your password is securely stored and never displayed.
        </p>

      </div>
    </section>
  );
}