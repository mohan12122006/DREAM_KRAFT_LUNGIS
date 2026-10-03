import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import '../styles/seller.css';

export default function AdminSellers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const data = await api.getAllSellers();
      setSellers(data || []);
    } catch (e) {
      setError(e.message || 'Unable to load sellers');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/account');
      return;
    }

    load();
  }, [user]);

  const changeStatus = async (id, status) => {
    try {
      setError('');

      await api.updateSellerStatus(id, status);

      await load();
    } catch (e) {
      setError(e.message || 'Unable to update seller');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <section className="seller-page">
      <div className="seller-dashboard">

        <div className="seller-dashboard-header">
          <div>
            <p className="seller-eyebrow">ADMIN</p>

            <h1>
              <ShieldCheck size={28} />
              Seller Management
            </h1>

            <p>
              Approve, reject or suspend seller accounts.
            </p>
          </div>
        </div>

        {error && (
          <div className="seller-error">
            {error}
          </div>
        )}

        <div className="seller-panel">

          <div className="seller-admin-list">

            {sellers.length > 0 ? (
              sellers.map((seller) => (
                <div
                  className="seller-admin-row"
                  key={seller.id}
                >

                  <div className="seller-admin-info">

                    <strong>
                      {seller.storeName}
                    </strong>

                    <span>
                      {seller.name} · {seller.email}
                    </span>

                    <small>
                      {seller.city || ''}
                      {seller.state
                        ? `, ${seller.state}`
                        : ''}
                    </small>

                  </div>

                  <div className="seller-admin-actions">

                    <span
                      className={`seller-status seller-status-${seller.status}`}
                    >
                      {seller.status}
                    </span>

                    <select
                      value={seller.status}
                      onChange={(e) =>
                        changeStatus(
                          seller.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="approved">
                        Approved
                      </option>

                      <option value="rejected">
                        Rejected
                      </option>

                      <option value="suspended">
                        Suspended
                      </option>
                    </select>

                  </div>

                </div>
              ))
            ) : (
              <p className="seller-muted">
                No sellers found.
              </p>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}