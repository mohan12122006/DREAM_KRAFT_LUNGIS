import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/auth.css';

export default function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const loggedUser = await login(values);
      showToast('Login successful');
      navigate(loggedUser?.role === 'seller' ? '/seller' : '/account');
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
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
       
        <h1>Login</h1>

        <p className="auth-description">
          Login to your account
        </p>

        <form onSubmit={submit}>

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

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={values.password}
            onChange={(e) =>
              setValues({
                ...values,
                password: e.target.value
              })
            }
            required
          />

          <button
            type="submit"
            className="auth-button"
          >
            LOGIN
          </button>

        </form>

        <p className="auth-bottom-text">
          Want to sell on DREAM KRAFT LUNGIS? <Link to="/seller/register">Become a Seller</Link>
        </p>

        <p className="auth-bottom-text">
          Don't have an account?{' '}
          <Link to="/register">
            Create Account
          </Link>
        </p>

      </div>
    </section>
  );
}