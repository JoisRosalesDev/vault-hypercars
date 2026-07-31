"use client";

import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export function useHypercarCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useHypercarCart must be used within a CartProvider");
  }

  const {
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
  } = context;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalUSD = cart.reduce((acc, item) => acc + item.priceUSD * item.quantity, 0);
  const formattedTotal = formatPrice(totalUSD, currency);

  return {
    cart,
    cartCount,
    totalUSD,
    formattedTotal,
    currency,
    setCurrency,
    addToCart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    formatPrice,
    toastMessage
  };
}

export const useCart = useHypercarCart;
