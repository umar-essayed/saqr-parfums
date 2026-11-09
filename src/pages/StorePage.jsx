import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BestsellerSlider from '../components/BestsellerSlider';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';

export default function StorePage() {
  return (
    <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Bestseller Auto-Slider */}
        <BestsellerSlider />

        {/* Featured Products: ONLY first 3 products loaded on Home page */}
        <ProductGrid limit={3} showViewAll={true} />
      </main>

      <Footer />

      {/* Overlays & Drawers */}
      <ProductModal />
      <CartDrawer />
    </div>
  );
}
