import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, config } from '../lib/supabase';
import { AlertCircle, RefreshCw, ShoppingBag, Eye, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart, getPerfumePrice } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function ProductGrid({ limit = null, showViewAll = false }) {
  const navigate = useNavigate();
  const { t, getLocalizedPerfume, lang } = useAppSettings();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  const { addToCart, setSelectedPerfume } = useCart();

  const fetchPerfumes = async () => {
    setLoading(true);
    setError(null);

    if (!config.isConfigured || !supabase) {
      setError(lang === 'ar' ? 'قاعدة بيانات Supabase غير متصلة.' : 'Database is disconnected.');
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('perfumes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setPerfumes(data || []);
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError(lang === 'ar' ? 'فشل تحميل تشكيلة العطور من قاعدة البيانات.' : 'Failed to fetch perfumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfumes();
  }, [limit]);

  const handleSizeChange = (perfumeId, size, e) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [perfumeId]: size }));
  };

  return (
    <section id="collection" className="py-16 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs text-saqr-gold tracking-widest uppercase block mb-2 font-medium">
            {t('brandOriginPill')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {limit ? (lang === 'ar' ? 'مختارات من التشكيلة' : 'Featured Extraits') : (lang === 'ar' ? 'التشكيلة الكاملة' : 'The Complete Collection')}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-saqr-gray font-light">
            {t('shopDesc')}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-saqr-gold/20 border-t-saqr-gold animate-spin" />
            <span className="text-xs text-saqr-gray tracking-wide">
              {lang === 'ar' ? 'جاري جلب عطور صقر...' : 'Loading SAQR fragrances...'}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
            </button>
          </div>
        )}

        {/* Products Grid (50% Image with melting gradient) */}
        {!loading && !error && perfumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {perfumes.map((rawPerfume) => {
              const perfume = getLocalizedPerfume(rawPerfume);
              const isComingSoon = rawPerfume.name === 'قريباً' || rawPerfume.slug === 'coming-soon-secret';
              const currentSize = selectedSizes[rawPerfume.id] || 100;
              const currentPrice = getPerfumePrice(rawPerfume, currentSize);

              return (
                <div
                  key={rawPerfume.id}
                  className="group relative flex flex-col bg-[#0E0E12] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:-translate-y-1 transform-gpu [backface-visibility:hidden]"
                >
                  {/* Upper 50%: Unified bottle image with seamless fade */}
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

                    {/* Melting Gradient Effect */}
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

                  {/* Lower 50%: Details & Pricing */}
                  <div className="relative z-20 -mt-2 p-6 pt-3 flex flex-col justify-between flex-1 text-center bg-[#0E0E12]">
                    <div
                      onClick={() => !isComingSoon && navigate(`/perfume/${rawPerfume.slug || rawPerfume.id}`)}
                      className="cursor-pointer mb-4"
                    >
                      <span className="text-xs text-saqr-gold font-light tracking-widest block mb-1">
                        {perfume.tagline || (lang === 'ar' ? 'عطر فاخر' : 'Luxury Fragrance')}
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
                    </div>

                    {!isComingSoon ? (
                      <div className="space-y-4">
                        {/* Size Switcher with explicit prices */}
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleSizeChange(rawPerfume.id, 50, e)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
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
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                              currentSize === 100
                                ? 'bg-saqr-gold text-black shadow-md'
                                : 'bg-white/5 text-saqr-gray hover:text-white hover:bg-white/10'
                            }`}
                          >
                            100 {lang === 'ar' ? 'مل' : 'ml'} (650 {t('currency')})
                          </button>
                        </div>

                        {/* Actions */}
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

        {/* View All Button for Home Page */}
        {showViewAll && (
          <div className="mt-14 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_30px_rgba(197,160,89,0.3)] active:scale-95 group"
            >
              <span>{t('viewAllPerfumes')}</span>
              {lang === 'ar' ? (
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
