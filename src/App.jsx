import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { CartProvider } from './context/CartContext';
import StorePage from './pages/StorePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import TrackOrderPage from './pages/TrackOrderPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AppSettingsProvider>
      <Router>
        <CartProvider>
          <Routes>
            {/* Main Luxury Brand Landing */}
            <Route path="/" element={<StorePage />} />

            {/* Dedicated Luxury Shop Catalog */}
            <Route path="/shop" element={<ShopPage />} />

            {/* Dedicated Luxury Product Details Page */}
            <Route path="/perfume/:slug" element={<ProductDetailPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />

            {/* Dedicated Luxury Checkout Page */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Customer Order Tracking */}
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/track/:orderCode" element={<TrackOrderPage />} />

            {/* Secure Admin Dashboard */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </Router>
    </AppSettingsProvider>
  );
}
