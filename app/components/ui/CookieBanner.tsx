"use client";

import React, { useSyncExternalStore } from "react";
import { CookieConsentPreferences } from "../../types/privacy";

const STORAGE_KEY = "vault_cookie_consent";
const CURRENT_VERSION = "1.0";

let isBannerManuallyOpened = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribeCookieBanner(callback: () => void) {
  listeners.add(callback);
  const handleOpenEvent = () => {
    isBannerManuallyOpened = true;
    notify();
  };
  window.addEventListener("vault_open_cookie_preferences", handleOpenEvent);
  window.addEventListener("storage", callback);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("vault_open_cookie_preferences", handleOpenEvent);
    window.removeEventListener("storage", callback);
  };
}

function getCookieBannerSnapshot(): boolean {
  if (isBannerManuallyOpened) return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return !stored;
  } catch {
    return true;
  }
}

function getCookieBannerServerSnapshot(): boolean {
  return false;
}

export function CookieBanner() {
  const isVisible = useSyncExternalStore(
    subscribeCookieBanner,
    getCookieBannerSnapshot,
    getCookieBannerServerSnapshot
  );

  const saveConsent = (analytics: boolean) => {
    const newConsent: CookieConsentPreferences = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    } catch (e) {
      console.error("[CookieBanner] Failed to save consent:", e);
    }
    isBannerManuallyOpened = false;
    notify();
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Consentimiento de Cookies y Privacidad"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-xl shadow-2xl animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-accent rounded-none animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-accent uppercase">
              GESTIÓN DE PRIVACIDAD // RGPD & LEY 21.719
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            Utilizamos almacenamiento local y cookies técnicas estrictamente necesarias para el funcionamiento del carrito de compras y la telemetría del sistema. Las cookies analíticas opcionales nos permiten optimizar el rendimiento. Usted puede aceptar o rechazar las cookies no esenciales con la misma facilidad y sin opciones premarcadas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => saveConsent(false)}
            type="button"
            className="px-5 py-3 rounded-none border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-200 text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer text-center uppercase"
          >
            RECHAZAR NO ESENCIALES
          </button>
          <button
            onClick={() => saveConsent(true)}
            type="button"
            className="px-6 py-3 rounded-none bg-accent text-accent-contrast hover:bg-accent-hover font-display font-black text-xs tracking-wider transition-all duration-150 shadow-[0_0_15px_var(--color-accent-glow)] cursor-pointer text-center uppercase"
          >
            ACEPTAR TODO
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
