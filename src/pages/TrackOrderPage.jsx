import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase, config } from '../lib/supabase';
import { Compass, Search, CheckCircle2, ShieldAlert, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';

export default function TrackOrderPage() {
  const { orderCode: paramCode } = useParams();
  const { t, lang } = useAppSettings();

  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusSteps = [
    {
      key: 'pending',
      label: lang === 'ar' ? 'تم تسجيل الطلب' : 'Order Placed',
      desc: lang === 'ar' ? 'تم استلام طلبك ومراجعته' : 'Order received & queued'
    },
    {
      key: 'confirmed',
      label: lang === 'ar' ? 'تم التأكيد' : 'Order Confirmed',
      desc: lang === 'ar' ? 'تم تأكيد طلبك مع العميل' : 'Order verified with client'
    },
    {
      key: 'processing',
      label: lang === 'ar' ? 'جاري التجهيز' : 'Bottling & Packaging',
      desc: lang === 'ar' ? 'يتم تغليف عطرك بعناية' : 'Aged extract packaged with care'
    },
    {
      key: 'shipped',
      label: lang === 'ar' ? 'خرج للتوصيل' : 'Out for Delivery',
      desc: lang === 'ar' ? 'الطلب مع مندوب الشحن' : 'Courier in transit with your parcel'
    },
    {
      key: 'delivered',
      label: lang === 'ar' ? 'تم التسليم' : 'Delivered Successfully',
      desc: lang === 'ar' ? 'نتمنى لك تجربة عطرية فاخرة' : 'Enjoy your signature royal sillage'
    }
  ];

  // Load order by code or token
  const searchOrder = async (codeToSearch) => {
    const code = (codeToSearch || searchInput).trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setOrderItems([]);

    if (!config.isConfigured || !supabase) {
      setError(lang === 'ar' ? 'قاعدة بيانات Supabase غير متصلة.' : 'Database is disconnected.');
      setLoading(false);
      return;
    }

    try {
      // Search by order code or token
      let query = supabase.from('orders').select('*');
      if (code.startsWith('TKN_')) {
        query = query.eq('tracking_token', (codeToSearch || searchInput).trim());
      } else {
        query = query.or(`order_code.eq.${code},tracking_token.eq.${(codeToSearch || searchInput).trim()}`);
      }

      const { data: orderData, error: orderErr } = await query.maybeSingle();

      if (orderErr) throw orderErr;

      if (!orderData) {
        setError(lang === 'ar' ? `لم يتم العثور على أي طلب بالكود: ${code}` : `No order found with code: ${code}`);
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // Fetch items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      setOrderItems(itemsData || []);
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError(lang === 'ar' ? 'حدث خطأ أثناء البحث عن الطلب في قاعدة البيانات.' : 'Error querying database for order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCode) {
      setSearchInput(paramCode);
      searchOrder(paramCode);
    } else {
      try {
        const saved = localStorage.getItem('saqr_last_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.order_code) {
            setSearchInput(parsed.order_code);
            searchOrder(parsed.order_code);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [paramCode]);

  // Determine current step index
  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.status === 'cancelled') return -1;
    const idx = statusSteps.findIndex((s) => s.key === order.status);
    return idx >= 0 ? idx : 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-saqr-base text-saqr-appleLight flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-28 pb-20">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-saqr-gold mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {t('trackHeading')}
          </h1>
          <p className="text-xs sm:text-sm text-saqr-gray font-light">
            {t('trackSubheading')}
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchOrder(searchInput);
          }}
          className="flex items-center gap-2 mb-8 bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 focus-within:border-saqr-gold transition-colors"
        >
          <input
            type="text"
            placeholder={t('trackInputPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none uppercase font-mono tracking-wider text-start"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs tracking-wide transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{t('trackSearchBtn')}</span>
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center mb-8">
            {error}
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Status Card */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-3xl p-6 sm:p-8">
              
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <div>
                  <span className="text-[11px] text-saqr-gray block">{t('orderRefLabel')}</span>
                  <span className="text-lg font-mono font-bold text-saqr-gold">
                    {order.order_code}
                  </span>
                </div>

                <div className="text-end">
                  <span className="text-[11px] text-saqr-gray block">
                    {lang === 'ar' ? 'التاريخ' : 'Date'}
                  </span>
                  <span className="text-xs text-white">
                    {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              {order.status === 'cancelled' ? (
                <div className="py-6 text-center text-red-400">
                  <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-80" />
                  <span className="text-sm font-bold block">{t('timelineCancelled')}</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.key} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-8 bottom-0 w-0.5 -mb-6 transition-colors ${
                              index < currentStep ? 'bg-saqr-gold' : 'bg-white/10'
                            }`}
                          />
                        )}

                        {/* Step Icon Marker */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-saqr-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.5)] ring-4 ring-saqr-gold/20'
                              : isCompleted
                              ? 'bg-saqr-gold/20 text-saqr-gold'
                              : 'bg-white/5 text-saqr-gray'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-[10px] font-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 pt-0.5 text-start">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent ? 'text-saqr-gold' : isCompleted ? 'text-white' : 'text-saqr-gray'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[11px] text-saqr-gray mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Delivery Info & Items */}
            <div className="bg-[#0F0F12] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div>
                <h3 className="text-xs font-semibold text-white tracking-wide mb-3 text-start">
                  {t('trackDetailsTitle')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-start">
                  <div>
                    <span className="text-saqr-gray block mb-0.5">{t('customerNameLabel')}</span>
                    <span className="text-white font-medium">{order.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-saqr-gray block mb-0.5">{t('phoneLabelShort')}</span>
                    <span className="text-white font-mono">{order.customer_phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-saqr-gray block mb-0.5">{t('addressLabelShort')}</span>
                    <span className="text-white font-medium">
                      {order.governorate} — {order.shipping_address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {orderItems.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-semibold text-white tracking-wide mb-3 text-start">
                    {t('orderedItemsTitle')}
                  </h3>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.perfume_name} className="w-8 h-8 object-contain" />
                          )}
                          <div className="text-start">
                            <span className="text-white font-medium block">{item.perfume_name}</span>
                            <span className="text-saqr-gray text-[10px]">
                              {lang === 'ar' ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                            </span>
                          </div>
                        </div>
                        <span className="text-white font-semibold">
                          {(Number(item.unit_price) * item.quantity).toLocaleString()} {t('currency')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total & Payment */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-start">
                  <span className="text-xs text-saqr-gray block">
                    {lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {lang === 'ar' ? order.payment_method : 'Cash on Delivery (COD)'}
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-xs text-saqr-gray block">
                    {lang === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                  </span>
                  <span className="text-sm font-bold text-saqr-gold">
                    {Number(order.total_amount) > 0 ? `${Number(order.total_amount).toLocaleString()} ${t('currency')}` : (lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
