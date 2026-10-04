"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CartItem, Currency, AddToCartInput } from "../types/cart";
import { formatPrice as formatPriceUtil } from "../lib/currency";

export interface CartContextType {
  cart: CartItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  formatPrice: (priceUSD: number, c?: Currency) => string;
  toastMessage: string | null;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addToCart = useCallback((item: AddToCartInput) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    setToastMessage(`¡${item.name} añadido al carrito!`);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const formatPrice = useCallback((priceUSD: number, cOverride?: Currency) => {
    return formatPriceUtil(priceUSD, cOverride || currency);
  }, [currency]);

  const contextValue = useMemo(() => ({
    cart,
    currency,
    setCurrency,
    addToCart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    formatPrice,
    toastMessage
  }), [cart, currency, isCartOpen, toastMessage, addToCart, removeFromCart, clearCart, formatPrice]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
