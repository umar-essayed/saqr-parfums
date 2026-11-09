import React, { useState } from 'react';
import { X, Sparkles, ShoppingBag, Lock } from 'lucide-react';
import { useCart, getPerfumePrice } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function ProductModal() {
  const { selectedPerfume, setSelectedPerfume, addToCart } = useCart();
  const { t, getLocalizedPerfume, lang } = useAppSettings();
  const [selectedSize, setSelectedSize] = useState(100);

  if (!selectedPerfume) return null;

  const rawPerfume = selectedPerfume;
  const perfume = getLocalizedPerfume(rawPerfume);
  const isComingSoon = rawPerfume.name === 'قريباً' || rawPerfume.slug === 'coming-soon-secret';
  const price = getPerfumePrice(rawPerfume, selectedSize);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedPerfume(null)}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#0E0E12] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedPerfume(null)}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black text-saqr-gray hover:text-white transition-colors backdrop-blur-md cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Perfume Visual with Melting Bottom Gradient */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black flex items-center justify-center">
          <img
            src={perfume.image_url}
            alt={perfume.name}
            className={`w-full h-full object-cover object-top ${
              isComingSoon ? 'filter blur-2xl scale-125 brightness-40' : ''
            }`}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/80 to-transparent pointer-events-none" />

          {isComingSoon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-saqr-gold mb-2 border border-saqr-gold/30">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-base font-bold tracking-widest text-saqr-gold uppercase">
                {t('mysteryComingSoonTitle')}
              </span>
              <span className="text-xs text-saqr-gray mt-1">
                {t('comingSoonSecret')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 pt-0 text-center">
          
          <span className="text-xs text-saqr-gold font-light tracking-widest block mb-1">
            {perfume.tagline || (lang === 'ar' ? 'عطر فاخر' : 'Luxury Perfume')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {perfume.name}
          </h2>

          {!isComingSoon && (
            <div className="text-xl font-bold text-saqr-gold mb-3">
              {price} {t('currency')} <span className="text-xs font-normal text-saqr-gray mx-1">/ {selectedSize} {lang === 'ar' ? 'مل' : 'ml'}</span>
            </div>
          )}

          {perfume.description && (
            <p className="text-xs sm:text-sm text-saqr-gray leading-relaxed max-w-sm mx-auto mb-6 font-light">
              {perfume.description}
            </p>
          )}

          {!isComingSoon && (
            <>
              {/* Size Selector with Prices */}
              <div className="mb-6">
                <span className="text-[11px] text-saqr-gray block mb-2">{t('bottleSizePrice')}</span>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSize(50)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                      selectedSize === 50
                        ? 'bg-saqr-gold text-black shadow-lg scale-105'
                        : 'bg-white/5 text-saqr-gray hover:text-white'
                    }`}
                  >
                    50 {lang === 'ar' ? 'مل' : 'ml'} — 350 {t('currency')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSize(100)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                      selectedSize === 100
                        ? 'bg-saqr-gold text-black shadow-lg scale-105'
                        : 'bg-white/5 text-saqr-gray hover:text-white'
                    }`}
                  >
                    100 {lang === 'ar' ? 'مل' : 'ml'} — 650 {t('currency')}
                  </button>
                </div>
              </div>

              {/* Pyramid Notes */}
              <div className="space-y-3 mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-start">
                <div className="text-xs font-semibold text-saqr-goldLight tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-saqr-gold" />
                  <span>{t('scentPyramid')}</span>
                </div>

                <div className="flex items-start justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-saqr-gray">{t('topNotesTitle')}:</span>
                  <span className="text-white font-medium">
                    {Array.isArray(perfume.top_notes) && perfume.top_notes.length > 0
                      ? perfume.top_notes.join(' • ')
                      : (lang === 'ar' ? 'حمضيات وتوابل ملكية' : 'Citrus & Spices')}
                  </span>
                </div>

                <div className="flex items-start justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-saqr-gray">{t('heartNotesTitle')}:</span>
                  <span className="text-white font-medium">
                    {Array.isArray(perfume.heart_notes) && perfume.heart_notes.length > 0
                      ? perfume.heart_notes.join(' • ')
                      : (lang === 'ar' ? 'أخشاب وزهور نادرة' : 'Aged Woods & Florals')}
                  </span>
                </div>

                <div className="flex items-start justify-between text-xs py-1">
                  <span className="text-saqr-gray">{t('baseNotesTitle')}:</span>
                  <span className="text-white font-medium">
                    {Array.isArray(perfume.base_notes) && perfume.base_notes.length > 0
                      ? perfume.base_notes.join(' • ')
                      : (lang === 'ar' ? 'عنبر، عود ومسك فاخر' : 'Amber, Oud & Musk')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  addToCart(rawPerfume, selectedSize);
                  setSelectedPerfume(null);
                }}
                className="w-full py-3.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('orderPerfume')} ({price} {t('currency')})</span>
              </button>
            </>
          )}

          {isComingSoon && (
            <button
              disabled
              className="w-full py-3.5 rounded-full bg-white/5 border border-white/10 text-saqr-gray text-xs font-medium cursor-not-allowed"
            >
              {t('comingSoonPill')}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
