import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase, supabaseAdmin, config } from '../lib/supabase';
import { useCart, OFFICIAL_PHONE, WHATSAPP_LINK } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Phone,
  MapPin,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t, getLocalizedPerfume, governorates, lang } = useAppSettings();
  const { cart, totalAmount, clearCart, saveOrderLocally } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: governorates[0] || 'القاهرة',
    address: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage(lang === 'ar' ? 'سلتك فارغة، يرجى اختيار عطور أولاً.' : 'Your bag is empty.');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى ملء الاسم، رقم الهاتف، والعنوان بالتفصيل.' : 'Please enter full name, phone number, and address.');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s\-\+]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(
        lang === 'ar'
          ? 'يرجى إدخال رقم هاتف صحيح للتواصل (11 رقم).'
          : 'Please enter a valid phone number (at least 10 digits).'
      );
      return;
    }

    const client = supabaseAdmin || supabase;
    if (!config.isConfigured || !client) {
      setErrorMessage(lang === 'ar' ? 'قاعدة بيانات المتجر غير متصلة.' : 'Store database is disconnected.');
      return;
    }

    setSubmitting(true);

    try {
      const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `SQR-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;
      const trackingToken = 'tkn_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

      // 1. Insert order into Supabase
      const { data: orderData, error: orderError } = await client
        .from('orders')
        .insert({
          order_code: orderCode,
          tracking_token: trackingToken,
          customer_name: formData.name.trim(),
          customer_phone: cleanPhone,
          governorate: formData.governorate,
          shipping_address: formData.address.trim(),
          notes: formData.notes.trim() || null,
          subtotal: totalAmount,
          shipping_fee: 0,
          total_amount: totalAmount,
          payment_method: 'الدفع عند الاستلام',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItemsToInsert = cart.map((item) => ({
        order_id: orderData.id,
        perfume_id: isUuid(item.id) ? item.id : null,
        perfume_name: `${item.name} (${item.volume_ml} ml)`,
        unit_price: item.price,
        quantity: item.quantity,
        image_url: item.image_url
      }));

      const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.warn('Error inserting items:', itemsError);
      }

      // 3. Save locally for instant tracking
      const savedInfo = {
        order_code: orderCode,
        tracking_token: trackingToken,
        order_id: orderData.id,
        customer_name: formData.name.trim(),
        customer_phone: cleanPhone,
        governorate: formData.governorate,
        shipping_address: formData.address.trim(),
        total_amount: totalAmount,
        status: 'pending',
        items: [...cart],
        created_at: new Date().toISOString()
      };

      saveOrderLocally(savedInfo);
      clearCart();
      setOrderSuccess(savedInfo);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Order checkout error:', err);
      const detail = err?.message || err?.error_description || (typeof err === 'string' ? err : '');
      setErrorMessage(
        lang === 'ar'
          ? `تعذر تأكيد الطلب: ${detail || 'يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب'}`
          : `Could not confirm order: ${detail || 'Please try again or contact us via WhatsApp'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingToken = () => {
    if (!orderSuccess?.tracking_token) return;
    navigator.clipboard.writeText(orderSuccess.tracking_token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // -------------------------------------------------------------
  // STATE: ORDER SUCCESS
  // -------------------------------------------------------------
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 pb-20 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-xl w-full bg-[#0E0E12] border border-saqr-gold/20 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden animate-fade-in">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-saqr-gold/15 blur-3xl pointer-events-none" />

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-saqr-gold/10 border border-saqr-gold/30 flex items-center justify-center text-saqr-gold mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs text-saqr-gold tracking-widest uppercase font-semibold block mb-2">
              {t('brandOriginPill')}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {t('orderSuccessTitle')}
            </h1>

            <p className="text-xs sm:text-sm text-saqr-gray leading-relaxed max-w-md mx-auto mb-6">
              {t('orderSuccessSubtitle')}
            </p>

            {/* Order Code Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 mb-6">
              <span className="text-xs text-saqr-gray block">{t('orderRefLabel')}</span>
              <span className="text-2xl font-mono font-black text-saqr-gold tracking-wider block">
                {orderSuccess.order_code}
              </span>
              <span className="text-[11px] text-zinc-500 block">
                {t('amountDueAtDelivery')} {Number(orderSuccess.total_amount).toLocaleString()} {t('currency')}
              </span>
            </div>

            {/* Tracking Token */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs mb-8 text-start">
              <div>
                <span className="text-[10px] text-saqr-gray block">{t('trackingTokenTitle')}</span>
                <span className="font-mono text-zinc-300 text-[11px] block truncate max-w-[220px]">
                  {orderSuccess.tracking_token}
                </span>
              </div>
              <button
                type="button"
                onClick={copyTrackingToken}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('copiedBtn')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-saqr-gold" />
                    <span>{t('copyBtn')}</span>
                  </>
                )}
              </button>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link
                to={`/track/${orderSuccess.order_code}`}
                className="w-full py-3.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{t('trackOrderAction')}</span>
                {lang === 'ar' ? (
                  <ArrowRight className="w-4 h-4 rotate-180" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Link>

              <a
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                  lang === 'ar'
                    ? `مرحباً صقر، قمت بإتمام الطلب رقم ${orderSuccess.order_code} بقيمة ${orderSuccess.total_amount} ج.م وأود المتابعة.`
                    : `Hello SAQR, I confirmed order ${orderSuccess.order_code} with total ${orderSuccess.total_amount} EGP and would like to confirm.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('whatsappConfirmAction')} ({OFFICIAL_PHONE})</span>
              </a>

              <Link
                to="/shop"
                className="block text-xs text-saqr-gray hover:text-white pt-2 transition-colors"
              >
                {t('backToShoppingAction')}
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: EMPTY CART
  // -------------------------------------------------------------
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 pb-20 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-[#0E0E12] border border-white/5 rounded-3xl p-8 sm:p-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-saqr-gold mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 opacity-40" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">{t('emptyCartTitle')}</h1>
            <p className="text-xs text-saqr-gray mb-6 leading-relaxed">
              {t('emptyCartText')}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs tracking-wide transition-all active:scale-95"
            >
              {t('exploreShopBtn')}
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE: CHECKOUT FORM
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb */}
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

          {/* Heading */}
          <div className="mb-10 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saqr-gold/10 border border-saqr-gold/20 text-saqr-gold text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('checkoutTag')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('checkoutHeading')}
            </h1>
            <p className="text-xs sm:text-sm text-saqr-gray mt-1 font-light">
              {t('checkoutSubheading')}
            </p>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#0E0E12] border border-white/5 rounded-3xl p-6 sm:p-8">
              <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-saqr-gold" />
                <span>{t('recipientSection')}</span>
              </h2>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs text-saqr-gray block mb-1.5 font-medium">
                    {t('fullNameLabel')} <span className="text-saqr-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('fullNamePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-saqr-gold transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs text-saqr-gray block mb-1.5 font-medium">
                    {t('phoneLabel')} <span className="text-saqr-gold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder={t('phonePlaceholder')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs sm:text-sm font-mono text-start focus:outline-none focus:border-saqr-gold transition-colors"
                  />
                </div>

                {/* Governorate */}
                <div>
                  <label className="text-xs text-saqr-gray block mb-1.5 font-medium">
                    {t('governorateLabel')} <span className="text-saqr-gold">*</span>
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#15151A] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-saqr-gold transition-colors cursor-pointer"
                  >
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detailed Address */}
                <div>
                  <label className="text-xs text-saqr-gray block mb-1.5 font-medium">
                    {t('addressLabel')} <span className="text-saqr-gold">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t('addressPlaceholder')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-saqr-gold transition-colors resize-none"
                  />
                </div>

                {/* Optional Delivery Notes */}
                <div>
                  <label className="text-xs text-saqr-gray block mb-1.5 font-medium">
                    {t('notesLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('notesPlaceholder')}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-saqr-gold transition-colors"
                  />
                </div>

                {/* Payment Method Banner */}
                <div className="pt-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-saqr-gold/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-saqr-gold/10 flex items-center justify-center text-saqr-gold flex-shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{t('paymentMethodTitle')}</span>
                        <span className="text-[11px] text-saqr-gray">{t('paymentMethodDesc')}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      COD
                    </span>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-full bg-saqr-gold hover:bg-saqr-goldLight disabled:opacity-50 text-black font-extrabold text-sm tracking-wide transition-all duration-300 shadow-xl active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('submittingOrder')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('confirmOrderSubmit').replace('{total}', totalAmount.toLocaleString())}</span>
                        {lang === 'ar' ? (
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-center text-saqr-gray block mt-2">
                    {t('confirmOrderNotice')}
                  </span>
                </div>
              </form>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Items Card */}
              <div className="bg-[#0E0E12] border border-white/5 rounded-3xl p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-sm font-bold text-white">{t('cartSummaryTitle')}</span>
                  <span className="text-xs text-saqr-gold font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} {t('itemsCount')}
                  </span>
                </div>

                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto no-scrollbar">
                  {cart.map((item) => {
                    const localized = getLocalizedPerfume(item);

                    return (
                      <div key={item.itemKey} className="py-3 flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={item.image_url} alt={localized.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{localized.name}</span>
                          <span className="text-[11px] text-saqr-gray block">
                            {lang === 'ar' ? `حجم ${item.volume_ml} مل • الكمية: ${item.quantity}` : `Size ${item.volume_ml} ml • Qty: ${item.quantity}`}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-saqr-gold whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString()} {t('currency')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals & Totals */}
                <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-saqr-gray">
                    <span>{t('subtotalLabel')}</span>
                    <span className="text-white font-medium">{totalAmount.toLocaleString()} {t('currency')}</span>
                  </div>
                  <div className="flex items-center justify-between text-saqr-gray">
                    <span>{t('shippingAndDelivery')}</span>
                    <span className="text-emerald-400 font-bold">{t('freeDeliveryBadge')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                    <span>{t('totalDueLabel')}</span>
                    <span className="text-base font-extrabold text-saqr-gold">
                      {totalAmount.toLocaleString()} {t('currency')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="bg-[#0E0E12] border border-white/5 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-3 text-xs">
                  <Truck className="w-4 h-4 text-saqr-gold flex-shrink-0" />
                  <span className="text-white font-medium">{t('promiseFastDelivery')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Shield className="w-4 h-4 text-saqr-gold flex-shrink-0" />
                  <span className="text-white font-medium">{t('promiseInspect')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Clock className="w-4 h-4 text-saqr-gold flex-shrink-0" />
                  <span className="text-white font-medium">{t('promiseLongevity')}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
