import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, config } from '../lib/supabase';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useCart, getPerfumePrice } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function BestsellerSlider() {
  const navigate = useNavigate();
  const { t, getLocalizedPerfume, lang } = useAppSettings();
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const sliderRef = useRef(null);

  const { addToCart } = useCart();

  const fetchBestsellers = async () => {
    setLoading(true);
    setError(null);

    if (!config.isConfigured || !supabase) {
      setError(lang === 'ar' ? 'قاعدة بيانات Supabase غير متصلة.' : 'Supabase database is disconnected.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: tableError } = await supabase
        .from('perfumes')
        .select('*')
        .eq('is_active', true)
        .neq('name', 'قريباً')
        .limit(6);

      if (tableError) throw tableError;
      setBestsellers(data || []);
    } catch (err) {
      console.error('Error fetching bestsellers:', err);
      setError(lang === 'ar' ? 'فشل تحميل قائمة الأكثر طلباً من قاعدة البيانات.' : 'Failed to fetch bestsellers from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestsellers();
  }, []);

  // Smooth continuous auto rotation
  useEffect(() => {
    if (loading || error || bestsellers.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const currentScroll = Math.abs(scrollLeft);

        const direction = lang === 'ar' ? -320 : 320;

        if (currentScroll >= maxScroll - 15) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: direction, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [loading, error, bestsellers, isPaused, lang]);

  const handleSizeChange = (perfumeId, size, e) => {
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [perfumeId]: size }));
  };

  return (
    <section id="bestsellers" className="py-16 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Minimal Section Title */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs text-saqr-gold tracking-widest uppercase block mb-1 font-medium">
              {t('bestsellerTag')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('bestsellerTitle')}
            </h2>
          </div>
          <span className="text-xs text-saqr-gray font-light hidden sm:inline">
            {t('bestsellerDesc')}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-saqr-gold/20 border-t-saqr-gold animate-spin" />
            <span className="text-xs text-saqr-gray tracking-wide">
              {lang === 'ar' ? 'جاري تحميل العطور الأكثر طلباً...' : 'Loading bestsellers...'}
            </span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-12 px-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-200 mb-4">{error}</p>
            <button
              onClick={fetchBestsellers}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
            </button>
          </div>
        )}

        {/* Auto Slider */}
        {!loading && !error && bestsellers.length > 0 && (
          <div
            ref={sliderRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex items-stretch gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4 cursor-grab active:cursor-grabbing"
          >
            {bestsellers.map((rawPerfume) => {
              const perfume = getLocalizedPerfume(rawPerfume);
              const currentSize = selectedSizes[rawPerfume.id] || 100;
              const currentPrice = getPerfumePrice(rawPerfume, currentSize);

              return (
                <div
                  key={rawPerfume.id}
                  className="flex-none w-[280px] sm:w-[310px] group flex flex-col bg-[#0E0E12] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform-gpu [backface-visibility:hidden]"
                >
                  {/* Upper 50% image */}
                  <div
                    onClick={() => navigate(`/perfume/${rawPerfume.slug || rawPerfume.id}`)}
                    className="relative h-60 w-full overflow-hidden cursor-pointer bg-[#0E0E12]"
                  >
                    <img
                      src={perfume.image_url}
                      alt={perfume.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 transform-gpu"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-[#0E0E12] from-25% via-[#0E0E12]/85 to-transparent pointer-events-none z-10" />
                  </div>

                  {/* Lower 50% info */}
                  <div className="relative z-20 -mt-2 p-5 pt-3 flex flex-col justify-between flex-1 text-center bg-[#0E0E12]">
                    <div
                      onClick={() => navigate(`/perfume/${rawPerfume.slug || rawPerfume.id}`)}
                      className="cursor-pointer mb-3"
                    >
                      <span className="text-xs text-saqr-gold font-light tracking-wide block mb-0.5">
                        {perfume.tagline || (lang === 'ar' ? 'عطر فاخر' : 'Extrait de Parfum')}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-saqr-goldLight transition-colors">
                        {perfume.name}
                      </h3>
                      <div className="mt-1 text-sm font-extrabold text-white">
                        <span className="text-saqr-gold">{currentPrice} {t('currency')}</span>
                        <span className="text-[11px] font-normal text-saqr-gray mx-1">/ {currentSize} {lang === 'ar' ? 'مل' : 'ml'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Size Switcher */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleSizeChange(rawPerfume.id, 50, e)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            currentSize === 50
                              ? 'bg-saqr-gold text-black shadow-md'
                              : 'bg-white/5 text-saqr-gray hover:text-white'
                          }`}
                        >
                          50 {lang === 'ar' ? 'مل' : 'ml'} (350 {t('currency')})
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSizeChange(rawPerfume.id, 100, e)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            currentSize === 100
                              ? 'bg-saqr-gold text-black shadow-md'
                              : 'bg-white/5 text-saqr-gray hover:text-white'
                          }`}
                        >
                          100 {lang === 'ar' ? 'مل' : 'ml'} (650 {t('currency')})
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => addToCart(rawPerfume, currentSize)}
                        className="w-full py-2.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-xs tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('orderPerfume')} ({currentPrice} {t('currency')})</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
