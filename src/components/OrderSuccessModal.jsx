import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Compass, Phone } from 'lucide-react';
import { OFFICIAL_PHONE } from '../context/CartContext';

export default function OrderSuccessModal({ order, onClose }) {
  const navigate = useNavigate();

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#0F0F12] border border-saqr-gold/20 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(197,160,89,0.15)]">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-saqr-gold/10 text-saqr-gold flex items-center justify-center mx-auto mb-4 border border-saqr-gold/30">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-xs text-saqr-gold font-light tracking-widest uppercase block mb-1">
          تم استلام طلبك بنجاح
        </span>

        <h3 className="text-2xl font-extrabold text-white mb-2">
          شكراً لاختيارك صقر
        </h3>

        <p className="text-xs sm:text-sm text-saqr-gray leading-relaxed mb-6">
          سيقوم فريق صقر بتجهيز عطرك الفاخر وشحنه فوراً إلى {order.governorate}. الدفع عند الاستلام نقداً مع المندوب.
        </p>

        {/* Order Code Box */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-6 text-center">
          <span className="text-[11px] text-saqr-gray block mb-1">كود الطلب الخاص بك</span>
          <span className="text-2xl font-mono font-bold tracking-widest text-saqr-gold">
            {order.order_code}
          </span>
          <span className="text-[10px] text-saqr-gray block mt-1">
            تم حفظ توكن التتبع تلقائياً على جهازك
          </span>
        </div>

        {/* Support Phone */}
        <div className="mb-6 text-xs text-saqr-gray">
          <span>لأي استفسار أو تعديل، تواصل معنا: </span>
          <a href={`tel:${OFFICIAL_PHONE}`} className="text-saqr-gold font-mono font-bold hover:underline">
            {OFFICIAL_PHONE}
          </a>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              navigate(`/track/${order.order_code}`);
            }}
            className="w-full py-3 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <Compass className="w-4 h-4" />
            <span>متابعة مسار الطلب</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
          >
            العودة للمتجر
          </button>
        </div>

      </div>
    </div>
  );
}
