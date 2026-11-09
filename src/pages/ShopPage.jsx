import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StoriesBar from '../components/StoriesBar';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { supabase, config } from '../lib/supabase';
import { Search, ShoppingBag, Eye, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart, getPerfumePrice } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function ShopPage() {
  const navigate = useNavigate();
  const { t, getLocalizedPerfume, lang } = useAppSettings();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState({});

  const { addToCart, setSelectedPerfume } = useCart();

  const categories = [
    { key: 'all', label: t('categoryAll') },
    { key: 'men', label: t('categoryMen') },
    { key: 'unisex', label: t('categoryUnisex') },
    { key: 'special', label: t('categorySpecial') }
  ];

  const fetchPerfumes = async () => {
    setLoading(true);
    setError(null);

    if (!config.isConfigured || !supabase) {
      setError(lang === 'ar' ? 'قاعدة بيانات Supabase غير متصلة.' : 'Database is disconnected.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('perfumes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      setPerfumes(data || []);
    } catch (err) {
      console.error('Error fetching perfumes for shop:', err);
      setError(lang === 'ar' ? 'فشل جلب العطور من قاعدة البيانات.' : 'Failed to fetch perfumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfumes();
  }, []);

  const handleSizeChange = (perfumeId, size, e) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [perfumeId]: size }));
  };

  // Filtered perfumes
  const filteredPerfumes = perfumes.filter((rawP) => {
    const p = getLocalizedPerfume(rawP);
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      q === '' ||
      p.name?.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q) ||
      p.top_notes?.some((n) => n.toLowerCase().includes(q)) ||
      p.heart_notes?.some((n) => n.toLowerCase().includes(q)) ||
      p.base_notes?.some((n) => n.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'men' && (rawP.gender?.includes('رجالي') || p.gender?.toLowerCase() === 'men')) ||
      (selectedCategory === 'unisex' && (rawP.gender?.includes('للجنسين') || p.gender?.toLowerCase() === 'unisex')) ||
      (selectedCategory === 'special' && (rawP.gender?.includes('خاص') || rawP.name === 'قريباً' || p.name === 'Coming Soon'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        
        {/* Shop Header */}
        <div className="pt-6 pb-8 px-4 sm:px-6 max-w-6xl mx-auto text-center">
          <span className="text-xs text-saqr-gold tracking-widest uppercase block mb-1.5 font-medium">
            {t('shopTag')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
            {t('shopTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-saqr-gray font-light max-w-md mx-auto mb-8">
            {t('shopDesc')}
          </p>

          {/* 1. Instagram Stories Bar DIRECTLY ABOVE SEARCH BAR */}
          <div className="mb-8">
            <StoriesBar />
          </div>

          {/* 2. Search & Filter Controls */}
          <div className="max-w-xl mx-auto space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3.5 pr-11 pl-11 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-saqr-gold transition-colors"
              />
              <Search className={`w-4 h-4 text-saqr-gold absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-saqr-gold text-black shadow-md'
                      : 'bg-white/5 text-saqr-gray hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          
          {/* Loading */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-saqr-gold/20 border-t-saqr-gold animate-spin" />
              <span className="text-xs text-saqr-gray tracking-wide">
                {lang === 'ar' ? 'جاري تحميل عطور المتجر...' : 'Loading fragrances...'}
              </span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-16 px-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-center max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-200 mb-4">{error}</p>
              <button
                onClick={fetchPerfumes}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
              </button>
            </div>
          )}

          {/* Empty search */}
          {!loading && !error && filteredPerfumes.length === 0 && (
            <div className="py-20 text-center text-saqr-gray text-sm">
              <p className="mb-3">{t('noResults')}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-full bg-saqr-gold text-black text-xs font-bold cursor-pointer"
              >
                {t('resetFilter')}
              </button>
            </div>
          )}

          {/* Grid of Perfumes */}
          {!loading && !error && filteredPerfumes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {filteredPerfumes.map((rawPerfume) => {
                const perfume = getLocalizedPerfume(rawPerfume);
                const isComingSoon = rawPerfume.name === 'قريباً' || rawPerfume.slug === 'coming-soon-secret';
                const currentSize = selectedSizes[rawPerfume.id] || 100;
                const currentPrice = getPerfumePrice(rawPerfume, currentSize);

                return (
                  <div
                    key={rawPerfume.id}
                    className="group relative flex flex-col bg-[#0E0E12] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:-translate-y-1 transform-gpu [backface-visibility:hidden]"
                  >
                    {/* Upper 50%: Unified bottle image */}
                    <div
                      onClick={() => !isComingSoon && navigate(`/perfume/${rawPerfume.slug || rawPerfume.id}`)}
                      className="relative h-64 sm:h-72 w-full overflow-hidden cursor-pointer bg-[#0E0E12]"
                    >
                      <img
                        src={perfume.image_url}
                        alt={perfume.name}
                        className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu ${
                          isComingSoon ? 'filter blur-2xl scale-125 brightness-40' : ''
                        }`}
                        loading="lazy"
                      />

                      {/* Melting Gradient */}
                      <div className="absolute inset-x-0 -bottom-1 h-36 bg-gradient-to-t from-[#0E0E12] from-25% via-[#0E0E12]/85 to-transparent pointer-events-none z-10" />

                      {/* Coming Soon Mystery Overlay */}
                      {isComingSoon && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-saqr-gold mb-2 border border-saqr-gold/30">
                            <Lock className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold tracking-widest text-saqr-gold uppercase">
                            {t('mysteryComingSoonTitle')}
                          </span>
                          <span className="text-[11px] text-saqr-gray mt-1">
                            {t('comingSoonSecret')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lower 50%: Details */}
                    <div className="relative z-20 -mt-2 p-6 pt-3 flex flex-col justify-between flex-1 text-center bg-[#0E0E12]">
                      <div
                        onClick={() => !isComingSoon && navigate(`/perfume/${rawPerfume.slug || rawPerfume.id}`)}
                        className="cursor-pointer mb-4"
                      >
                        <span className="text-xs text-saqr-gold font-light tracking-widest block mb-1">
                          {perfume.tagline || (lang === 'ar' ? 'عطر فاخر' : 'Extrait de Parfum')}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-saqr-goldLight transition-colors">
                          {perfume.name}
                        </h3>

                        {!isComingSoon && (
                          <div className="mt-2 text-base font-extrabold text-white">
                            <span className="text-saqr-gold">{currentPrice} {t('currency')}</span>
                            <span className="text-xs font-normal text-saqr-gray mx-1">/ {currentSize} {lang === 'ar' ? 'مل' : 'ml'}</span>
                          </div>
                        )}

                        {perfume.description && (
                          <p className="mt-2 text-xs text-saqr-gray line-clamp-2 leading-relaxed font-light">
                            {perfume.description}
                          </p>
                        )}
                      </div>

                      {/* Size Selector */}
                      {!isComingSoon ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleSizeChange(rawPerfume.id, 50, e)}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                                currentSize === 50
                                  ? 'bg-saqr-gold text-black shadow-md'
                                  : 'bg-white/5 text-saqr-gray hover:text-white hover:bg-white/10'
                              }`}
                            >
                              50 {lang === 'ar' ? 'مل' : 'ml'} (350 {t('currency')})
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSizeChange(rawPerfume.id, 100, e)}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                                currentSize === 100
                                  ? 'bg-saqr-gold text-black shadow-md'
                                  : 'bg-white/5 text-saqr-gray hover:text-white hover:bg-white/10'
                              }`}
                            >
                              100 {lang === 'ar' ? 'مل' : 'ml'} (650 {t('currency')})
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => addToCart(rawPerfume, currentSize)}
                              className="flex-1 py-3 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-xs tracking-wide transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{t('orderPerfume')} ({currentPrice} {t('currency')})</span>
                            </button>

                            <button
                              onClick={() => setSelectedPerfume(rawPerfume)}
                              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-saqr-gray hover:text-white transition-colors cursor-pointer"
                              title={t('viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4">
                          <button
                            disabled
                            className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-saqr-gray text-xs font-medium cursor-not-allowed"
                          >
                            {t('comingSoonPill')}
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* Overlays */}
      <ProductModal />
      <CartDrawer />
      <Footer />
    </div>
  );
}
