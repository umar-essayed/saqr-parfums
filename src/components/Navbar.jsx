import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Compass, Sun, Moon, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme, lang, toggleLang, t } = useAppSettings();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 pt-3">
        <nav className="apple-glass border border-white/5 rounded-full px-4 sm:px-5 py-2.5 flex items-center justify-between shadow-2xl">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/images/logo.png"
                alt="SAQR"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-bold tracking-widest text-lg bg-gradient-to-l from-white via-saqr-goldLight to-saqr-gold bg-clip-text text-transparent">
                {t('brandName')}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm text-saqr-gray font-medium">
              <Link to="/" className="hover:text-white transition-colors duration-200">
                {t('home')}
              </Link>
              <Link to="/shop" className="text-white hover:text-saqr-gold transition-colors duration-200 flex items-center gap-1">
                <span>{t('shop')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-saqr-gold" />
              </Link>
              <a href="/#bestsellers" className="hover:text-white transition-colors duration-200">
                {t('bestsellers')}
              </a>
              <a href="/#heritage" className="hover:text-white transition-colors duration-200">
                {t('heritage')}
              </a>
            </div>
          </div>

          {/* Controls: Language, Theme, Track Order, Cart (NO ADMIN LINK) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all active:scale-95"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              aria-label="Language switch"
            >
              <Globe className="w-3.5 h-3.5 text-saqr-gold" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                {lang === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
              title={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-saqr-gold" />
              ) : (
                <Moon className="w-4 h-4 text-saqr-gold" />
              )}
            </button>

            {/* Track Order */}
            <Link
              to="/track"
              title={t('trackOrder')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-saqr-gray hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-saqr-gold" />
              <span className="hidden sm:inline">{t('trackOrder')}</span>
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-200 active:scale-95"
              aria-label={t('cart')}
              title={t('cart')}
            >
              <ShoppingBag className="w-4 h-4 text-saqr-gold" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-saqr-gold text-black text-[10px] font-bold flex items-center justify-center animate-fade-in shadow-md">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </nav>
      </div>
    </header>
  );
}
