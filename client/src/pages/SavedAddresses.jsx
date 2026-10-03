import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Check,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const emptyAddress = {
  id: null,
  label: 'Home',
  customerName: '',
  mobileNumber: '',
  doorNumber: '',
  street: '',
  city: '',
  district: '',
  state: '',
  pinCode: ''
};

export default function SavedAddresses() {
  const { user } = useAuth();
  const { showToast } = useToast();

  /*
   * IMPORTANT:
   * Every logged-in account gets a different localStorage key.
   *
   * Example:
   * User ID 1 -> dkl_saved_addresses_user_1
   * User ID 2 -> dkl_saved_addresses_user_2
   *
   * If ID is unavailable, email is used as fallback.
   */
  const accountKey = useMemo(() => {
    if (!user) return null;

    const uniqueId =
      user.id ??
      user.userId ??
      user.email?.trim().toLowerCase();

    if (!uniqueId) return null;

    return `dkl_saved_addresses_user_${String(uniqueId)}`;
  }, [user]);

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /*
   * Load addresses whenever the logged-in account changes.
   */
  useEffect(() => {
    if (!accountKey) {
      setAddresses([]);
      setForm(emptyAddress);
      setShowForm(false);
      setEditingId(null);
      return;
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem(accountKey) || '[]'
      );

      setAddresses(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error('Unable to load saved addresses:', error);
      setAddresses([]);
    }

    setForm(emptyAddress);
    setShowForm(false);
    setEditingId(null);
  }, [accountKey]);

  /*
   * Save addresses ONLY under the current user's key.
   */
  const saveAddresses = (nextAddresses) => {
    if (!accountKey) return;

    setAddresses(nextAddresses);

    localStorage.setItem(
      accountKey,
      JSON.stringify(nextAddresses)
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const openAdd = () => {
    setForm({
      ...emptyAddress,
      customerName: user?.name || '',
      mobileNumber: user?.phone || ''
    });

    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (address) => {
    setForm({
      ...emptyAddress,
      ...address
    });

    setEditingId(address.id);
    setShowForm(true);
  };

  const saveAddress = (event) => {
    event.preventDefault();

    if (!accountKey) {
      showToast('Please login again before saving an address', 'error');
      return;
    }

    if (
      !form.customerName.trim() ||
      !form.mobileNumber.trim() ||
      !form.doorNumber.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.state.trim() ||
      !form.pinCode.trim()
    ) {
      showToast('Please fill all address fields', 'error');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim())) {
      showToast(
        'Enter a valid 10-digit mobile number',
        'error'
      );
      return;
    }

    if (!/^\d{6}$/.test(form.pinCode.trim())) {
      showToast(
        'Enter a valid 6-digit PIN code',
        'error'
      );
      return;
    }

    const cleanedAddress = {
      ...form,
      customerName: form.customerName.trim(),
      mobileNumber: form.mobileNumber.trim(),
      doorNumber: form.doorNumber.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      pinCode: form.pinCode.trim()
    };

    if (editingId !== null) {
      const nextAddresses = addresses.map((address) =>
        address.id === editingId
          ? {
              ...cleanedAddress,
              id: editingId
            }
          : address
      );

      saveAddresses(nextAddresses);

      showToast('Address updated successfully');
    } else {
      const newAddress = {
        ...cleanedAddress,
        id: `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 9)}`
      };

      saveAddresses([
        ...addresses,
        newAddress
      ]);

      showToast('Address saved successfully');
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyAddress);
  };

  const deleteAddress = (id) => {
    const nextAddresses = addresses.filter(
      (address) => address.id !== id
    );

    saveAddresses(nextAddresses);

    showToast('Address removed');
  };

  if (!user) {
    return (
      <section className="saved-address-page">
        <div className="saved-address-empty">
          <MapPin size={42} />

          <h2>Login Required</h2>

          <p>
            Login to save and manage your delivery
            addresses.
          </p>

          <Link
            to="/login"
            className="btn btn-primary"
          >
            LOGIN
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="saved-address-page">
      <div className="saved-address-container">

        <Link
          to="/account"
          className="saved-address-back"
        >
          <ArrowLeft size={18} />
          Back to Account
        </Link>

        <div className="saved-address-header">
          <div>
            <p className="eyebrow">
              DREAM KRAFT LUNGIS
            </p>

            <h1>Saved Addresses</h1>

            <p>
              Save your delivery address and use it
              whenever you place an order.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAdd}
          >
            <Plus size={17} />
            ADD NEW ADDRESS
          </button>
        </div>

        {/* ADDRESS FORM */}

        {showForm && (
          <div className="saved-address-form-card">

            <div className="saved-address-form-header">
              <div>
                <h2>
                  {editingId !== null
                    ? 'Edit Address'
                    : 'Add New Address'}
                </h2>

                <p>
                  Enter your delivery details.
                </p>
              </div>
            </div>

            <form onSubmit={saveAddress}>

              <div className="saved-address-form-grid">

                <label>
                  Address Type

                  <select
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                  >
                    <option value="Home">
                      Home
                    </option>

                    <option value="Work">
                      Work
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>

                <label>
                  Full Name

                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </label>

                <label>
                  Mobile Number

                  <input
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </label>

                <label>
                  Door / House Number

                  <input
                    name="doorNumber"
                    value={form.doorNumber}
                    onChange={handleChange}
                    placeholder="Door / House number"
                  />
                </label>

                <label>
                  Street

                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="Street name"
                  />
                </label>

                <label>
                  City

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </label>

                <label>
                  District

                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="District"
                  />
                </label>

                <label>
                  State

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </label>

                <label>
                  PIN Code

                  <input
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength="6"
                  />
                </label>

              </div>

              <div className="saved-address-form-actions">

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyAddress);
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Check size={17} />
                  SAVE ADDRESS
                </button>

              </div>

            </form>
          </div>
        )}

        {/* SAVED ADDRESSES */}

        {!addresses.length && !showForm ? (
          <div className="saved-address-empty">

            <div className="saved-address-empty-icon">
              <MapPin size={42} />
            </div>

            <h2>No Saved Addresses</h2>

            <p>
              Add your delivery address once and use
              it for future orders.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={openAdd}
            >
              <Plus size={17} />
              ADD ADDRESS
            </button>

          </div>
        ) : (
          <div className="saved-address-grid">

            {addresses.map((address) => (

              <article
                className="saved-address-card"
                key={address.id}
              >

                <div className="saved-address-card-header">

                  <div className="saved-address-type">
                    <MapPin size={18} />

                    <strong>
                      {address.label}
                    </strong>
                  </div>

                  <div className="saved-address-actions">

                    <button
                      type="button"
                      onClick={() =>
                        openEdit(address)
                      }
                      aria-label="Edit address"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteAddress(address.id)
                      }
                      aria-label="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

                <h3>
                  {address.customerName}
                </h3>

                <p>
                  {address.doorNumber},{' '}
                  {address.street}
                  <br />

                  {address.city},{' '}
                  {address.district}
                  <br />

                  {address.state} -{' '}
                  {address.pinCode}
                </p>

                <span className="saved-address-phone">
                  {address.mobileNumber}
                </span>

              </article>

            ))}

          </div>
        )}

      </div>
    </section>
  );
}