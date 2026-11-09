import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const getPerfumePrice = (perfume, volume_ml) => {
  if (perfume?.name === 'قريباً' || perfume?.slug === 'coming-soon-secret') return 0;
  return Number(volume_ml) === 50 ? 350 : 650;
};

export const OFFICIAL_PHONE = '01041586186';
export const WHATSAPP_LINK = 'https://wa.me/201041586186';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('saqr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('saqr_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saqr_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (perfume, selectedVolume = 100, quantity = 1) => {
    if (perfume.name === 'قريباً') return;

    const volume = Number(selectedVolume) === 50 ? 50 : 100;
    const itemKey = `${perfume.id}-${volume}`;
    const effectivePrice = getPerfumePrice(perfume, volume);

    setCart(prev => {
      const existing = prev.find(item => item.itemKey === itemKey);
      if (existing) {
        return prev.map(item =>
          item.itemKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        itemKey,
        id: perfume.id,
        name: perfume.name,
        price: effectivePrice,
        volume_ml: volume,
        image_url: perfume.image_url,
        tagline: perfume.tagline,
        quantity
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemKey) => {
    setCart(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.itemKey === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const saveOrderLocally = (orderData) => {
    setActiveOrder(orderData);
    try {
      localStorage.setItem('saqr_last_order', JSON.stringify(orderData));
      const existingHistory = JSON.parse(localStorage.getItem('saqr_orders_history') || '[]');
      const updated = [orderData, ...existingHistory.filter(o => o.order_code !== orderData.order_code)];
      localStorage.setItem('saqr_orders_history', JSON.stringify(updated.slice(0, 10)));
    } catch (e) {
      console.error('Failed to store order locally', e);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        selectedPerfume,
        setSelectedPerfume,
        activeOrder,
        saveOrderLocally,
        totalAmount,
        totalItems,
        OFFICIAL_PHONE,
        WHATSAPP_LINK
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
