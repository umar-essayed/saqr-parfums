import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

export default function Hero() {
  const { t, lang } = useAppSettings();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Background Image Visual with Apple-style Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-banner.png"
          alt="SAQR Parfums"
          className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Layered smooth gradients for seamless blending into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-saqr-base via-saqr-base/80 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-saqr-base/60 to-saqr-base" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Subtle Egyptian Origin Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-saqr-gold/20 text-saqr-goldLight text-xs tracking-wider mb-6 animate-fade-in backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-saqr-gold animate-pulse" />
          <span>{t('brandOriginPill')}</span>
        </div>

        {/* Big Apple-Style Minimalist Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
          {t('heroTitle1')}{' '}
          <span className="block mt-2 bg-gradient-to-r from-saqr-gold via-saqr-goldLight to-saqr-gold bg-clip-text text-transparent">
            {t('heroTitle2')}
          </span>
        </h1>

        {/* Concise Luxury Egyptian Statement */}
        <p className="max-w-xl text-base sm:text-lg text-saqr-gray font-light leading-relaxed mb-10">
          {t('heroDesc')}
        </p>

        {/* Minimalist Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(197,160,89,0.25)] active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>{t('exploreShop')}</span>
            {lang === 'ar' ? (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>

          <a
            href="#bestsellers"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-sm tracking-wide border border-white/10 transition-all duration-300 backdrop-blur-md flex items-center justify-center"
          >
            {t('bestsellersBtn')}
          </a>
        </div>

        {/* Apple-style 3 Quick Pillars (Floating on the background) */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-16 pt-8 border-t border-white/5 text-center w-full max-w-lg">
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-saqr-gold mb-1.5" />
            <span className="text-white text-xs sm:text-sm font-semibold">{t('pillarLongevity')}</span>
            <span className="text-saqr-gray text-[11px]">{t('pillarLongevitySub')}</span>
          </div>

          <div className="flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-saqr-gold mb-1.5" />
            <span className="text-white text-xs sm:text-sm font-semibold">{t('pillarPurity')}</span>
            <span className="text-saqr-gray text-[11px]">{t('pillarPuritySub')}</span>
          </div>

          <div className="flex flex-col items-center">
            <Shield className="w-4 h-4 text-saqr-gold mb-1.5" />
            <span className="text-white text-xs sm:text-sm font-semibold">{t('pillarCod')}</span>
            <span className="text-saqr-gray text-[11px]">{t('pillarCodSub')}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
