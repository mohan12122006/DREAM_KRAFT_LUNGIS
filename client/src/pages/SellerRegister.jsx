import React, { useState } from 'react';
import { Store, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/seller.css';

export default function SellerRegister() {
  const { registerSeller } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', storeName: '', email: '', phone: '', password: '', address: '', city: '', district: '', state: 'Tamil Nadu', pinCode: '', businessDescription: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await registerSeller(form);
      navigate('/seller');
    } catch (err) {
      setError(err.message || 'Seller registration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="seller-page">
      <div className="seller-auth-card">
        <div className="seller-icon"><Store size={30} /></div>
        <p className="seller-eyebrow">DREAM KRAFT LUNGIS</p>
        <h1>Become a Seller</h1>
        <p className="seller-muted">Create your store and sell traditional cotton lungis through the marketplace.</p>
        {error && <div className="seller-error">{error}</div>}
        <form className="seller-form" onSubmit={submit}>
          <label>Full Name<input name="name" value={form.name} onChange={update} required /></label>
          <label>Store Name<input name="storeName" value={form.storeName} onChange={update} required /></label>
          <div className="seller-form-grid">
            <label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label>
            <label>Mobile<input name="phone" value={form.phone} onChange={update} /></label>
          </div>
          <label>Password<input type="password" name="password" value={form.password} onChange={update} minLength={8} required /></label>
          <label>Address<textarea name="address" value={form.address} onChange={update} rows="2" /></label>
          <div className="seller-form-grid">
            <label>City<input name="city" value={form.city} onChange={update} /></label>
            <label>District<input name="district" value={form.district} onChange={update} /></label>
            <label>State<input name="state" value={form.state} onChange={update} /></label>
            <label>PIN Code<input name="pinCode" value={form.pinCode} onChange={update} /></label>
          </div>
          <label>Business Description<textarea name="businessDescription" value={form.businessDescription} onChange={update} rows="3" /></label>
          <button className="seller-primary-button" disabled={saving} type="submit"><UserPlus size={18} />{saving ? 'Creating...' : 'CREATE SELLER ACCOUNT'}</button>
        </form>
        <p className="seller-auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </section>
  );
}
