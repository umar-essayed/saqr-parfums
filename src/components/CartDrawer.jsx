import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, ShieldCheck, Phone } from 'lucide-react';
import { useCart, OFFICIAL_PHONE } from '../context/CartContext';
import { useAppSettings } from '../context/AppSettingsContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { t, getLocalizedPerfume, lang } = useAppSettings();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalAmount
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      <div className={`fixed inset-y-0 ${lang === 'ar' ? 'left-0' : 'right-0'} max-w-full flex ${lang === 'ar' ? 'pl-0 sm:pl-10' : 'pr-0 sm:pr-10'}`}>
        <div className="w-screen max-w-md bg-[#0C0C0E] border-x border-white/10 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide">{t('cartHeader')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-saqr-gold text-black font-bold">
                {totalItems}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-saqr-gray hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            
            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-saqr-gold mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{t('emptyCartTitle')}</h3>
                <p className="text-xs text-saqr-gray max-w-xs mb-6">
                  {t('emptyCartText')}
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-saqr-gold text-black font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  {t('exploreShopBtn')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs text-saqr-gray block font-medium">
                  {t('selectedItemsInCart')}
                </span>

                {cart.map((item) => {
                  const localized = getLocalizedPerfume(item);

                  return (
                    <div
                      key={item.itemKey}
                      className="flex items-center gap-3 py-3 border-b border-white/5"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-16 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/5">
                        <img
                          src={item.image_url}
                          alt={localized.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {localized.name}
                        </h4>
                        <span className="text-[11px] text-saqr-gold font-medium block mt-0.5">
                          {lang === 'ar' ? `الحجم: ${item.volume_ml} مل` : `Size: ${item.volume_ml} ml`}
                        </span>
                        <span className="text-xs font-bold text-white block mt-0.5">
                          {(item.price * item.quantity).toLocaleString()} {t('currency')}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.itemKey, -1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-saqr-gray hover:text-white cursor-pointer"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.itemKey, 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-saqr-gray hover:text-white cursor-pointer"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.itemKey)}
                        className="p-1.5 text-saqr-gray hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Footer & Proceed to Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/5 bg-[#08080A]/90 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs text-saqr-gray">
                <span>{t('shippingAndDelivery')}</span>
                <span className="text-saqr-gold font-medium">
                  {lang === 'ar' ? 'من 60 ج.م حسب المحافظة' : 'From 60 EGP by Region'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-white pb-1">
                <span>{t('totalPriceLabel')}</span>
                <span className="text-base text-saqr-gold font-extrabold">
                  {totalAmount.toLocaleString()} {t('currency')}
                </span>
              </div>

              {/* Proceed to dedicated checkout page */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-full bg-saqr-gold hover:bg-saqr-goldLight text-black font-extrabold text-sm tracking-wide transition-all duration-300 shadow-xl active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{t('proceedToCheckout')}</span>
                {lang === 'ar' ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-saqr-gray">
                <ShieldCheck className="w-3.5 h-3.5 text-saqr-gold" />
                <span>{t('inspectBeforePayCart')}</span>
              </div>

              <div className="text-center pt-1 border-t border-white/5">
                <a
                  href={`tel:${OFFICIAL_PHONE}`}
                  className="text-[11px] text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-saqr-gold" />
                  <span>{t('customerCare')}: {OFFICIAL_PHONE}</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
