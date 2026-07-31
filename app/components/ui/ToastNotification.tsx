"use client";

import React from "react";
import { ShoppingCartIcon } from "./Icons";
import { useHypercarCart } from "../../hooks/useHypercarCart";

export interface ToastNotificationProps {
  message?: string | null;
}

export function ToastNotification({ message }: ToastNotificationProps) {
  const { toastMessage: contextMessage } = useHypercarCart();
  const displayMessage = message !== undefined ? message : contextMessage;

  if (!displayMessage) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-[#d4af37] text-black px-6 py-3 rounded-lg font-bold text-xs shadow-[0_0_30px_rgba(212,175,55,0.5)] animate-bounce flex items-center gap-2">
      <ShoppingCartIcon className="w-4 h-4 text-black" /> {displayMessage}
    </div>
  );
}

export default ToastNotification;
