import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, MessageCircle } from 'lucide-react';
import { OFFICIAL_PHONE, WHATSAPP_LINK } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function Footer() {
  const { t, lang } = useAppSettings();

  return (
    <footer id="heritage" className="border-t border-white/5 bg-[#060608] pt-16 pb-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Egyptian Heritage Statement */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="w-12 h-12 mx-auto mb-4 opacity-85">
            <img src="/images/logo.png" alt="SAQR" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide">
            {lang === 'ar' ? 'صَقْر • أَصَالَةٌ مِصْرِيَّة' : 'SAQR • EGYPTIAN HERITAGE'}
          </h3>
          <p className="text-xs sm:text-sm text-saqr-gray leading-relaxed font-light mb-6">
            {t('footerBrandDesc')}
          </p>

          {/* Official Hotline & WhatsApp */}
          <div className="inline-flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-full px-5 py-2">
            <a
              href={`tel:${OFFICIAL_PHONE}`}
              className="flex items-center gap-1.5 text-xs text-white hover:text-saqr-gold transition-colors font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-saqr-gold" />
              <span>{OFFICIAL_PHONE}</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'واتساب صقر' : 'SAQR WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-white/5 mb-12 text-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">
              {lang === 'ar' ? 'أسعار معتمدة وموحدة' : 'Standardized Pricing'}
            </span>
            <p className="text-[11px] text-saqr-gray">
              {lang === 'ar' ? '50 مل بـ 350 ج.م • 100 مل بـ 650 ج.م' : '50 ml: 350 EGP • 100 ml: 650 EGP'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">
              {t('pillarCod')}
            </span>
            <p className="text-[11px] text-saqr-gray">
              {lang === 'ar' ? 'الدفع نقداً عند استلام شحنتك لباب بيتك' : 'Cash on delivery right to your doorstep'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white block">
              {lang === 'ar' ? 'شحن سريع لكافة المحافظات' : 'Express Nationwide Dispatch'}
            </span>
            <p className="text-[11px] text-saqr-gray">
              {lang === 'ar' ? 'تغليف فاخر يصلك أينما كنت في مصر' : 'Royal packaging delivered anywhere in Egypt'}
            </p>
          </div>
        </div>

        {/* Bottom Bar - ZERO ADMIN LINKS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-saqr-gray font-light">
          <div className="flex items-center gap-1">
            <span>{t('madeInEgypt')}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" />
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-white transition-colors">{t('home')}</Link>
            <Link to="/shop" className="hover:text-white transition-colors">{t('shop')}</Link>
            <Link to="/track" className="hover:text-white transition-colors">{t('trackOrder')}</Link>
          </div>

          <div>
            <span>© {new Date().getFullYear()} {lang === 'ar' ? 'عطور صقر. جميع الحقوق محفوظة.' : 'SAQR Parfums. All rights reserved.'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
