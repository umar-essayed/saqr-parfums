import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { supabase, config } from '../lib/supabase';
import { useCart, getPerfumePrice, OFFICIAL_PHONE, WHATSAPP_LINK } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Clock,
  Shield,
  Truck,
  MessageCircle,
  Plus,
  Minus,
  Lock,
  AlertCircle
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, getLocalizedPerfume, lang } = useAppSettings();

  const [rawPerfume, setRawPerfume] = useState(null);
  const [relatedPerfumes, setRelatedPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState(100);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPerfumeData = async () => {
      setLoading(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!config.isConfigured || !supabase) {
        setError(lang === 'ar' ? 'قاعدة بيانات Supabase غير متصلة.' : 'Database is disconnected.');
        setLoading(false);
        return;
      }

      try {
        const decodedSlug = decodeURIComponent(slug || '').trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedSlug);

        let query = supabase.from('perfumes').select('*');
        if (isUuid) {
          query = query.or(`slug.eq.${decodedSlug},id.eq.${decodedSlug}`);
        } else {
          query = query.eq('slug', decodedSlug);
        }

        let { data, error: fetchErr } = await query.maybeSingle();

        // If not found by exact slug and not a UUID, try case-insensitive or name match
        if (!data && !isUuid) {
          const { data: fallbackSlug } = await supabase
            .from('perfumes')
            .select('*')
            .ilike('slug', decodedSlug)
            .maybeSingle();
          if (fallbackSlug) {
            data = fallbackSlug;
          } else {
            const { data: fallbackName } = await supabase
              .from('perfumes')
              .select('*')
              .ilike('name', decodedSlug)
              .maybeSingle();
            if (fallbackName) data = fallbackName;
          }
        }

        if (fetchErr && !data) throw fetchErr;

        if (!data) {
          setError(lang === 'ar' ? 'لم يتم العثور على هذا العطر.' : 'Fragrance not found.');
          setLoading(false);
          return;
        }

        setRawPerfume(data);

        // Fetch 3 related perfumes
        const { data: related } = await supabase
          .from('perfumes')
          .select('*')
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(3);

        setRelatedPerfumes(related || []);
      } catch (err) {
        console.error('Error fetching perfume:', err);
        setError(lang === 'ar' ? 'فشل جلب تفاصيل العطر من قاعدة البيانات.' : 'Failed to fetch perfume details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumeData();
  }, [slug, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pt-24">
          <div className="w-10 h-10 rounded-full border-2 border-saqr-gold/20 border-t-saqr-gold animate-spin" />
          <span className="text-xs text-saqr-gray tracking-wide">
            {lang === 'ar' ? 'جاري استرجاع تفاصيل العطر...' : 'Loading perfume details...'}
          </span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !rawPerfume) {
    return (
      <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">{error || (lang === 'ar' ? 'العطر غير موجود' : 'Fragrance not found')}</h2>
          <Link
            to="/shop"
            className="mt-4 px-6 py-2.5 rounded-full bg-saqr-gold text-black font-bold text-xs"
          >
            {t('backToShop')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const perfume = getLocalizedPerfume(rawPerfume);
  const isComingSoon = rawPerfume.name === 'قريباً' || rawPerfume.slug === 'coming-soon-secret';
  const price = getPerfumePrice(rawPerfume, selectedSize);

  return (
    <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb / Back Link */}
          <div className="mb-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs text-saqr-gray hover:text-white transition-colors group"
            >
              {lang === 'ar' ? (
                <ArrowRight className="w-4 h-4 text-saqr-gold group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowLeft className="w-4 h-4 text-saqr-gold group-hover:-translate-x-1 transition-transform" />
              )}
              <span>{t('backToShop')}</span>
            </Link>
          </div>

          {/* Product Hero Grid (2 Columns on Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Column 1 (Left 6 cols): Image Stage with Melting Fade */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden bg-[#0E0E12] border border-white/5 shadow-2xl flex items-center justify-center">
                
                {/* Ambient Glow */}
                <div className="absolute inset-12 rounded-full bg-saqr-gold/10 blur-3xl pointer-events-none" />

                <img
                  src={perfume.image_url}
                  alt={perfume.name}
                  className={`w-full h-full object-cover object-top transition-transform duration-700 ${
                    isComingSoon ? 'filter blur-2xl scale-125 brightness-40' : ''
                  }`}
                />

                {/* Melting Gradient at bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12]/80 to-transparent pointer-events-none" />

                {/* Coming Soon Overlay */}
                {isComingSoon && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 bg-black/50 backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-saqr-gold mb-3 border border-saqr-gold/30">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-widest text-saqr-gold uppercase">
                      {t('mysteryComingSoonTitle')}
                    </span>
                    <span className="text-xs text-saqr-gray mt-1 max-w-xs">
                      {t('mysteryComingSoonText')}
                    </span>
                  </div>
                )}
              </div>

              {/* 3 Value Badges under Image */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="bg-[#0E0E12] border border-white/5 rounded-2xl p-3">
                  <Clock className="w-4 h-4 text-saqr-gold mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-white block">{t('badge24h')}</span>
                  <span className="text-[10px] text-saqr-gray">{t('badge24hSub')}</span>
                </div>
                <div className="bg-[#0E0E12] border border-white/5 rounded-2xl p-3">
                  <Shield className="w-4 h-4 text-saqr-gold mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-white block">{t('badgeInspect')}</span>
                  <span className="text-[10px] text-saqr-gray">{t('badgeInspectSub')}</span>
                </div>
                <div className="bg-[#0E0E12] border border-white/5 rounded-2xl p-3">
                  <Truck className="w-4 h-4 text-saqr-gold mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-white block">{t('badgeFreeShip')}</span>
                  <span className="text-[10px] text-saqr-gray">{t('badgeFreeShipSub')}</span>
                </div>
              </div>
            </div>

            {/* Column 2 (Right 6 cols): Product Info & Buying Actions */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Title & Tagline */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saqr-gold/10 border border-saqr-gold/20 text-saqr-gold text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('houseOfSaqr')}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {perfume.name}
                </h1>
                
                <span className="text-sm sm:text-base text-saqr-gold font-light tracking-widest block mt-1">
                  {perfume.tagline || (lang === 'ar' ? 'عطر خالص فاخر' : 'Pure Luxury Extrait')}
                </span>

                {/* Price Display */}
                {!isComingSoon && (
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {price} <span className="text-lg text-saqr-gold font-bold">{t('currency')}</span>
                    </span>
                    <span className="text-xs text-saqr-gray">
                      {t('freeShippingNotice').replace('{size}', selectedSize)}
                    </span>
                  </div>
                )}

                {perfume.description && (
                  <p className="mt-4 text-xs sm:text-sm text-saqr-gray leading-relaxed font-light">
                    {perfume.description}
                  </p>
                )}
              </div>

              {!isComingSoon && (
                <>
                  {/* Size Selector */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{t('bottleSizePrice')}</span>
                      <span className="text-saqr-gold text-[11px]">
                        {lang === 'ar' ? 'متاح بالتسليم الفوري' : 'Ready for Immediate Dispatch'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSize(50)}
                        className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                          selectedSize === 50
                            ? 'bg-saqr-gold/10 border-saqr-gold shadow-[0_0_20px_rgba(197,160,89,0.15)] ring-1 ring-saqr-gold'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-saqr-gray'
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{t('size50Label')}</span>
                        <span className="text-sm font-extrabold text-saqr-gold block mt-1">350 {t('currency')}</span>
                        <span className="text-[10px] text-saqr-gray block mt-0.5">{t('size50Sub')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSize(100)}
                        className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                          selectedSize === 100
                            ? 'bg-saqr-gold/10 border-saqr-gold shadow-[0_0_20px_rgba(197,160,89,0.15)] ring-1 ring-saqr-gold'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-saqr-gray'
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{t('size100Label')}</span>
                        <span className="text-sm font-extrabold text-saqr-gold block mt-1">650 {t('currency')}</span>
                        <span className="text-[10px] text-saqr-gray block mt-0.5">{t('size100Sub')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity & Add to Cart Action */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-[#0E0E12] border border-white/10 rounded-full px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(rawPerfume, selectedSize, quantity)}
                        className="flex-1 py-3.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{t('addToCartBtn').replace('{total}', (price * quantity).toLocaleString())}</span>
                      </button>
                    </div>

                    {/* Direct WhatsApp Consultation */}
                    <a
                      href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                        lang === 'ar'
                          ? `مرحباً صقر، أود الاستفسار عن عطر "${perfume.name}" بحجم ${selectedSize} مل.`
                          : `Hello SAQR, I would like to inquire about "${perfume.name}" in size ${selectedSize} ml.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t('whatsappConsult')}</span>
                    </a>
                  </div>

                  {/* Scent Pyramid */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-saqr-gold" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {t('scentPyramid')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Top */}
                      <div className="bg-[#0E0E12] border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-saqr-gold uppercase tracking-wider block mb-1">
                          {t('topNotesTitle')}
                        </span>
                        <p className="text-xs font-semibold text-white">
                          {Array.isArray(perfume.top_notes) && perfume.top_notes.length > 0
                            ? perfume.top_notes.join(' • ')
                            : (lang === 'ar' ? 'حمضيات وتوابل نادرة' : 'Rare Citrus & Spices')}
                        </p>
                      </div>

                      {/* Heart */}
                      <div className="bg-[#0E0E12] border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-saqr-gold uppercase tracking-wider block mb-1">
                          {t('heartNotesTitle')}
                        </span>
                        <p className="text-xs font-semibold text-white">
                          {Array.isArray(perfume.heart_notes) && perfume.heart_notes.length > 0
                            ? perfume.heart_notes.join(' • ')
                            : (lang === 'ar' ? 'زهور وأخشاب معتقة' : 'Aged Woods & Florals')}
                        </p>
                      </div>

                      {/* Base */}
                      <div className="bg-[#0E0E12] border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-saqr-gold uppercase tracking-wider block mb-1">
                          {t('baseNotesTitle')}
                        </span>
                        <p className="text-xs font-semibold text-white">
                          {Array.isArray(perfume.base_notes) && perfume.base_notes.length > 0
                            ? perfume.base_notes.join(' • ')
                            : (lang === 'ar' ? 'عنبر، عود، مسك فاخر' : 'Amber, Oud & Musk')}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isComingSoon && (
                <div className="pt-4">
                  <button
                    disabled
                    className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-saqr-gray text-xs font-semibold cursor-not-allowed"
                  >
                    {t('bookingOpensSoon')}
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Related Perfumes Recommendations */}
          {relatedPerfumes.length > 0 && (
            <div className="mt-28 pt-12 border-t border-white/5">
              <div className="text-center max-w-lg mx-auto mb-12">
                <span className="text-xs text-saqr-gold tracking-widest uppercase block mb-1">
                  {t('bestsellerTag')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {t('relatedPerfumesTitle')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPerfumes.map((rawRel) => {
                  const rel = getLocalizedPerfume(rawRel);
                  const isRelComingSoon = rawRel.name === 'قريباً';

                  return (
                    <div
                      key={rawRel.id}
                      onClick={() => navigate(`/perfume/${rawRel.slug || rawRel.id}`)}
                      className="group relative flex flex-col bg-[#0E0E12] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:-translate-y-1 cursor-pointer transform-gpu [backface-visibility:hidden]"
                    >
                      <div className="relative h-60 w-full overflow-hidden bg-[#0E0E12]">
                        <img
                          src={rel.image_url}
                          alt={rel.name}
                          className={`w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 transform-gpu ${
                            isRelComingSoon ? 'filter blur-xl brightness-40' : ''
                          }`}
                        />
                        <div className="absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-[#0E0E12] from-25% via-[#0E0E12]/85 to-transparent pointer-events-none z-10" />
                      </div>

                      <div className="relative z-20 -mt-2 p-5 pt-3 text-center bg-[#0E0E12]">
                        <span className="text-[11px] text-saqr-gold font-light block mb-0.5">
                          {rel.tagline}
                        </span>
                        <h4 className="text-lg font-bold text-white group-hover:text-saqr-goldLight transition-colors">
                          {rel.name}
                        </h4>
                        {!isRelComingSoon && (
                          <div className="mt-1 text-xs font-bold text-white">
                            350 {t('currency')} <span className="text-saqr-gray text-[10px]">/ 650 {t('currency')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
