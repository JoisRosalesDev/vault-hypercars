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
    <div className="fixed top-20 right-6 z-50 bg-accent text-accent-contrast px-5 py-2.5 rounded-none font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_var(--color-accent-glow)] flex items-center gap-2 border border-accent">
      <ShoppingCartIcon className="w-4 h-4 text-accent-contrast" /> {displayMessage}
    </div>
  );
}

export default ToastNotification;
