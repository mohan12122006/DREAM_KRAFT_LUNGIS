import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import Profile from './pages/Profile.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import SavedAddresses from './pages/SavedAddresses.jsx';
import Notifications from './pages/Notifications.jsx';

import About from './pages/About.jsx';
import StaticPage from './pages/StaticPage.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Orders from './pages/Orders.jsx';
import TrackOrder from './pages/TrackOrder.jsx';

import Categories from './pages/Categories.jsx';
import Offers from './pages/Offers.jsx';

import SellerRegister from './pages/SellerRegister.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import AdminSellers from './pages/AdminSellers.jsx';
import Invoice from './pages/Invoice.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Shopping */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/new-arrivals" element={<Shop preset="new" />} />
        <Route path="/best-sellers" element={<Shop preset="best" />} />
        <Route path="/offers" element={<Offers />} />

        {/* Products */}
        <Route path="/products/:slug" element={<ProductDetails />} />

        {/* Cart & Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<Confirmation />} />
        <Route path="/track-order/:id" element={<TrackOrder />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Account */}
        <Route path="/account" element={<Account />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/saved-addresses" element={<SavedAddresses />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Information */}
        <Route path="/about" element={<About />} />
        <Route
          path="/contact"
          element={<StaticPage title="Contact" />}
        />

        {/* Seller */}
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller" element={<SellerDashboard />} />

        {/* Admin */}
        <Route path="/admin/sellers" element={<AdminSellers />} />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        <Route
  path="/invoice/:id"
  element={<Invoice />}
/>

      </Route>
    </Routes>
  );
}