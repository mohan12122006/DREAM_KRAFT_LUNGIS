import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/auth.css';

export default function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (values.password !== values.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password
      });

      showToast('Account created successfully');
      navigate('/account');
    } catch (error) {
      showToast(
        error.message || 'Registration failed',
        'error'
      );
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <img
            src="/images/logo.png"
            alt="DREAM KRAFT LUNGIS"
          />
        </div>
           <p className="auth-tagline">
          Comfort Woven in Tradition
        </p>            

        <h1>Create Account</h1>

        <p className="auth-description">
          Create your DREAM KRAFT account
        </p>

        <form onSubmit={submit}>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={values.name}
            onChange={(e) =>
              setValues({
                ...values,
                name: e.target.value
              })
            }
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={values.email}
            onChange={(e) =>
              setValues({
                ...values,
                email: e.target.value
              })
            }
            required
          />

          <label>Mobile Number</label>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            value={values.phone}
            onChange={(e) =>
              setValues({
                ...values,
                phone: e.target.value
              })
            }
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create password"
            value={values.password}
            onChange={(e) =>
              setValues({
                ...values,
                password: e.target.value
              })
            }
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={values.confirmPassword}
            onChange={(e) =>
              setValues({
                ...values,
                confirmPassword: e.target.value
              })
            }
            required
          />

          <button
            type="submit"
            className="auth-button"
          >
            CREATE ACCOUNT
          </button>

        </form>

        <p className="auth-bottom-text">
          Want to sell on DREAM KRAFT LUNGIS? <Link to="/seller/register">Become a Seller</Link>
        </p>

        <p className="auth-bottom-text">
          Already have an account?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </section>
  );
}