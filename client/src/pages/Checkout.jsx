import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import EmptyState from '../components/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatMoney } from '../utils/money.js';

const initial = {
  customerName: '',
  mobileNumber: '',
  email: '',
  doorNumber: '',
  street: '',
  city: '',
  district: '',
  state: '',
  pinCode: '',
  paymentMethod: 'Cash on Delivery'
};

const FREE_DELIVERY_LIMIT = 999;

export default function Checkout() {

  const { items, totals, clearCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const navigate = useNavigate();

  const [values, setValues] = useState(initial);

  const [savedAddresses, setSavedAddresses] =
    useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState(null);

  const [showNewAddress, setShowNewAddress] =
    useState(false);

  const [saveNewAddress, setSaveNewAddress] =
    useState(true);

  const [errors, setErrors] = useState({});

  const [coupon, setCoupon] = useState('');

  const [placing, setPlacing] = useState(false);


  /* =========================================
     LOAD SAVED ADDRESSES
  ========================================= */

  useEffect(() => {

    if (!user) return;

    const key =
      `dkl_saved_addresses_${user.id || user.email}`;

    const saved = JSON.parse(
      localStorage.getItem(key) || '[]'
    );

    setSavedAddresses(saved);

    if (saved.length > 0) {

      const first = saved[0];

      setSelectedAddressId(first.id);

      setValues((current) => ({
        ...current,

        customerName: first.customerName || '',
        mobileNumber: first.mobileNumber || '',
        doorNumber: first.doorNumber || '',
        street: first.street || '',
        city: first.city || '',
        district: first.district || '',
        state: first.state || '',
        pinCode: first.pinCode || '',
        email: user.email || ''
      }));

    } else {

      setValues((current) => ({
        ...current,

        customerName: user.name || '',
        mobileNumber: user.phone || '',
        email: user.email || ''
      }));

      setShowNewAddress(true);
    }

  }, [user]);


  /* =========================================
     SELECT SAVED ADDRESS
  ========================================= */

  const selectAddress = (address) => {

    setSelectedAddressId(address.id);

    setShowNewAddress(false);

    setValues((current) => ({
      ...current,

      customerName:
        address.customerName || '',

      mobileNumber:
        address.mobileNumber || '',

      doorNumber:
        address.doorNumber || '',

      street:
        address.street || '',

      city:
        address.city || '',

      district:
        address.district || '',

      state:
        address.state || '',

      pinCode:
        address.pinCode || '',

      email:
        user?.email || current.email
    }));

    setErrors({});
  };


  /* =========================================
     ADD NEW ADDRESS
  ========================================= */

  const startNewAddress = () => {

    setSelectedAddressId(null);

    setShowNewAddress(true);

    setValues((current) => ({
      ...initial,

      customerName:
        user?.name || '',

      mobileNumber:
        user?.phone || '',

      email:
        user?.email || ''
    }));

    setErrors({});
  };


  /* =========================================
     SAVE ADDRESS
  ========================================= */

  const storeAddress = () => {

    if (!user) return;

    const key =
      `dkl_saved_addresses_${user.id || user.email}`;

    const saved = JSON.parse(
      localStorage.getItem(key) || '[]'
    );

    const newAddress = {
      id: Date.now(),

      label: 'Home',

      customerName:
        values.customerName,

      mobileNumber:
        values.mobileNumber,

      doorNumber:
        values.doorNumber,

      street:
        values.street,

      city:
        values.city,

      district:
        values.district,

      state:
        values.state,

      pinCode:
        values.pinCode
    };

    const next = [
      ...saved,
      newAddress
    ];

    localStorage.setItem(
      key,
      JSON.stringify(next)
    );

    setSavedAddresses(next);

    setSelectedAddressId(newAddress.id);

    showToast(
      'Address saved for future orders'
    );
  };


  /* =========================================
     VALIDATION
  ========================================= */

  const validate = () => {

    const next = {};

    Object.entries(values).forEach(
      ([key, value]) => {

        if (!value) {
          next[key] = 'Required';
        }

      }
    );

    if (
      values.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email
      )
    ) {
      next.email =
        'Enter a valid email';
    }

    if (
      values.mobileNumber &&
      !/^[6-9]\d{9}$/.test(
        values.mobileNumber
      )
    ) {
      next.mobileNumber =
        'Enter a valid 10-digit Indian mobile number';
    }

    if (
      values.pinCode &&
      !/^\d{6}$/.test(
        values.pinCode
      )
    ) {
      next.pinCode =
        'Enter a valid 6-digit PIN code';
    }

    setErrors(next);

    return !Object.keys(next).length;
  };


  /* =========================================
     PLACE ORDER
  ========================================= */

  const placeOrder = async (event) => {

    event.preventDefault();

    if (!validate() || placing) return;

    setPlacing(true);

    try {

      /*
       * Save newly entered address
       * before placing the order.
       */

      if (
        showNewAddress &&
        saveNewAddress &&
        user
      ) {
        storeAddress();
      }

      const order =
        await api.placeOrder({

          ...values,

          couponCode:
            coupon || undefined,

          items:
            items.map(item => ({
              productId:
                item.product.id,

              variantId:
                item.variantId,

              quantity:
                item.quantity
            }))
        });

      await clearCart();

      navigate(
        `/orders/${order.id}`
      );

    } catch (error) {

      showToast(
        error.message ||
        'Unable to place order',
        'error'
      );

    } finally {

      setPlacing(false);

    }
  };


  /* =========================================
     COUPON
  ========================================= */

  const applyCoupon = async () => {

    if (!coupon) return;

    try {

      const result =
        await api.validateCoupon(
          coupon
        );

      showToast(
        `${result.code} is valid at checkout`
      );

    } catch (error) {

      showToast(
        error.message,
        'error'
      );

    }
  };


  if (!items.length) {

    return (
      <EmptyState
        title="No checkout items"
        message="Add products to your cart before placing an order."
      />
    );
  }


  const deliveryText =
    totals.subtotal >= FREE_DELIVERY_LIMIT
      ? 'FREE'
      : formatMoney(totals.delivery);


  return (
    <section className="checkout-page content-section">

      <h1>Checkout</h1>

      <form
        className="checkout-layout"
        onSubmit={placeOrder}
      >

        <div className="form-panel">

          {/* =====================================
              SAVED ADDRESSES
          ===================================== */}

          {user && (
            <section className="checkout-address-section">

              <div className="checkout-section-heading">

                <div>
                  <h2>
                    Delivery Address
                  </h2>

                  <p>
                    Select a saved address
                    or add a new one.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-small"
                  onClick={startNewAddress}
                >
                  <Plus size={15} />
                  Add New
                </button>

              </div>


              {savedAddresses.length > 0 && (

                <div className="checkout-address-list">

                  {savedAddresses.map(
                    (address) => (

                      <button
                        type="button"
                        key={address.id}
                        className={
                          `checkout-address-card ${
                            selectedAddressId ===
                            address.id
                              ? 'selected'
                              : ''
                          }`
                        }
                        onClick={() =>
                          selectAddress(address)
                        }
                      >

                        <div className="checkout-address-icon">
                          <MapPin size={18} />
                        </div>

                        <div>

                          <strong>
                            {address.label}
                          </strong>

                          <p>
                            {address.customerName}
                          </p>

                          <span>
                            {address.doorNumber},{' '}
                            {address.street},{' '}
                            {address.city},{' '}
                            {address.district},{' '}
                            {address.state} -{' '}
                            {address.pinCode}
                          </span>

                          <small>
                            {address.mobileNumber}
                          </small>

                        </div>

                        {selectedAddressId ===
                          address.id && (
                          <Check
                            size={20}
                            className="checkout-address-check"
                          />
                        )}

                      </button>

                    )
                  )}

                </div>
              )}


              {/* NEW ADDRESS */}

              {showNewAddress && (

                <div className="checkout-new-address">

                  <h3>
                    {savedAddresses.length
                      ? 'New Delivery Address'
                      : 'Add Delivery Address'}
                  </h3>

                  <div className="checkout-address-grid">

                    <label>
                      Full Name

                      <input
                        value={values.customerName}
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              customerName:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.customerName && (
                        <small className="field-error">
                          {errors.customerName}
                        </small>
                      )}
                    </label>


                    <label>
                      Mobile Number

                      <input
                        value={values.mobileNumber}
                        maxLength="10"
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              mobileNumber:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.mobileNumber && (
                        <small className="field-error">
                          {errors.mobileNumber}
                        </small>
                      )}
                    </label>


                    <label>
                      Door / House Number

                      <input
                        value={values.doorNumber}
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              doorNumber:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.doorNumber && (
                        <small className="field-error">
                          {errors.doorNumber}
                        </small>
                      )}
                    </label>


                    <label>
                      Street

                      <input
                        value={values.street}
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              street:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.street && (
                        <small className="field-error">
                          {errors.street}
                        </small>
                      )}
                    </label>


                    <label>
                      City

                      <input
                        value={values.city}
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              city:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.city && (
                        <small className="field-error">
                          {errors.city}
                        </small>
                      )}
                    </label>


                    <label>
                      District

                      <input
                        value={values.district}
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              district:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.district && (
                        <small className="field-error">
                          {errors.district}
                        </small>
                      )}
                    </label>


                    <label>
                      State

                      <input
                        value={values.state}
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              state:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.state && (
                        <small className="field-error">
                          {errors.state}
                        </small>
                      )}
                    </label>


                    <label>
                      PIN Code

                      <input
                        value={values.pinCode}
                        maxLength="6"
                        onChange={(event) =>
                          setValues(
                            current => ({
                              ...current,
                              pinCode:
                                event.target.value
                            })
                          )
                        }
                      />

                      {errors.pinCode && (
                        <small className="field-error">
                          {errors.pinCode}
                        </small>
                      )}
                    </label>

                  </div>


                  <label className="save-address-checkbox">

                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(event) =>
                        setSaveNewAddress(
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      Save this address for
                      future orders
                    </span>

                  </label>

                </div>
              )}

            </section>
          )}


          {/* =====================================
              CUSTOMER DETAILS
          ===================================== */}

          <section className="checkout-customer-section">

            <h2>
              Customer Details
            </h2>

            <label>
              Email

              <input
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues(current => ({
                    ...current,
                    email:
                      event.target.value
                  }))
                }
              />

              {errors.email && (
                <small className="field-error">
                  {errors.email}
                </small>
              )}
            </label>

          </section>


          {/* =====================================
              PAYMENT
          ===================================== */}

          <fieldset>

            <legend>
              Payment Methods
            </legend>

            {[
              'Cash on Delivery',
              'Online Payment'
            ].map(method => (

              <label
                className="radio-label"
                key={method}
              >

                <input
                  type="radio"
                  name="payment"
                  checked={
                    values.paymentMethod ===
                    method
                  }
                  onChange={() =>
                    setValues(current => ({
                      ...current,
                      paymentMethod:
                        method
                    }))
                  }
                />

                {method}

              </label>
            ))}

            <p className="muted">
              Online payment provider
              integration placeholder is
              ready on the server.
            </p>

          </fieldset>

        </div>


        {/* =====================================
            ORDER SUMMARY
        ===================================== */}

        <aside className="summary-card">

          <h2>
            Order Summary
          </h2>

          {items.map(item => (

            <p key={item.product.id}>

              <span>
                {item.product.name} ×{' '}
                {item.quantity}
              </span>

              <strong>
                {formatMoney(
                  item.product.salePrice *
                  item.quantity
                )}
              </strong>

            </p>

          ))}


          <div className="summary-divider" />


          <p>
            <span>
              Subtotal
            </span>

            <strong>
              {formatMoney(
                totals.subtotal
              )}
            </strong>
          </p>


          <p>

            <span>
              Delivery Charge
            </span>

            <strong
              className={
                totals.delivery === 0
                  ? 'free-delivery'
                  : ''
              }
            >
              {deliveryText}
            </strong>

          </p>


          {totals.discount > 0 && (

            <p>

              <span>
                Discount
              </span>

              <strong className="discount-value">
                -
                {formatMoney(
                  totals.discount
                )}
              </strong>

            </p>

          )}


          <div className="summary-divider" />


          <p className="grand-total">

            <span>
              Grand Total
            </span>

            <strong>
              {formatMoney(
                totals.grandTotal
              )}
            </strong>

          </p>


          <div className="delivery-note">

            {totals.subtotal <
            FREE_DELIVERY_LIMIT

              ? `Add ${formatMoney(
                  FREE_DELIVERY_LIMIT -
                  totals.subtotal
                )} more for FREE delivery`

              : '🎉 You qualify for FREE delivery'}

          </div>


          {/* COUPON */}

          <label>
            Coupon code

            <input
              value={coupon}
              onChange={(event) =>
                setCoupon(
                  event.target.value
                    .toUpperCase()
                )
              }
              placeholder="FESTIVE30"
            />
          </label>


          <button
            className="btn btn-small"
            type="button"
            onClick={applyCoupon}
          >
            Validate Coupon
          </button>


          <button
            className="btn btn-primary"
            disabled={placing}
          >
            {placing
              ? 'Placing order...'
              : 'PLACE ORDER'}
          </button>


          <Link
            className="text-button"
            to="/cart"
          >
            Back to cart
          </Link>

        </aside>

      </form>

    </section>
  );
}