"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Currency } from "../../types/cart";
import { useHypercarCart } from "../../hooks/useHypercarCart";
import { ShoppingCartIcon, MenuIcon, CloseIcon } from "../ui/Icons";
import { ThemeToggle } from "../ui/ThemeToggle";

export interface NavbarProps {
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export function Navbar({
  currency: propCurrency,
  onCurrencyChange,
  cartCount: propCartCount,
  onOpenCart
}: NavbarProps) {
  const {
    currency: hookCurrency,
    setCurrency,
    cartCount: hookCartCount,
    setIsCartOpen
  } = useHypercarCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentCurrency = propCurrency ?? hookCurrency;
  const count = propCartCount ?? hookCartCount;
  const handleOpenCart = onOpenCart ?? (() => setIsCartOpen(true));
  const handleCurrencyChange = onCurrencyChange ?? setCurrency;

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-accent group-hover:text-white transition-colors duration-150">
            VAULT
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.4em] text-zinc-400 font-mono">
            HYPERCARS // TELEMETRY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.2em] text-zinc-400">
          <Link href="/" className="text-white hover:text-accent transition-colors">
            INICIO
          </Link>
          <Link href="#catalogo" className="hover:text-white transition-colors">
            CATÁLOGO
          </Link>
        </nav>

        {/* ThemeToggle & Currency Switcher & Cart Button & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Currency Switcher */}
          <div role="group" aria-label="Selector de divisa" className="hidden sm:flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-none">
            {(["USD", "EUR", "CLP"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                aria-label={`Seleccionar divisa ${c}`}
                aria-pressed={currentCurrency === c}
                className={`px-3 py-1.5 min-h-[32px] text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  currentCurrency === c
                    ? "bg-accent text-accent-contrast shadow-[0_0_10px_var(--color-accent-glow)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenCart}
            aria-label={`Abrir carrito de compras, ${count} artículos`}
            className="relative px-4 sm:px-5 py-2 sm:py-2.5 border border-accent/60 text-accent text-xs font-mono font-bold tracking-[0.2em] rounded-none hover:bg-accent hover:text-accent-contrast transition-all duration-150 shadow-[0_0_12px_var(--color-accent-glow)] flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            <span className="hidden sm:inline">CARRITO</span>
            {count > 0 && (
              <span className="w-4 h-4 rounded-none bg-accent text-accent-contrast font-mono font-black text-[10px] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-none border border-zinc-800 bg-zinc-900/60 text-white hover:border-accent transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Dropdown Menu */}
      {isMobileMenuOpen && (
        <nav aria-label="Navegación móvil" className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-bold tracking-widest text-white hover:text-accent py-2 border-b border-zinc-900"
          >
            INICIO
          </Link>
          <Link
            href="#catalogo"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-bold tracking-widest text-zinc-300 hover:text-white py-2"
          >
            CATÁLOGO DE COMPRA
          </Link>

          {/* Mobile Currency Selector */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono tracking-wider">DIVISA:</span>
            <div role="group" aria-label="Selector de divisa móvil" className="flex gap-1">
              {(["USD", "EUR", "CLP"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    handleCurrencyChange(c);
                    setIsMobileMenuOpen(false);
                  }}
                  aria-label={`Seleccionar divisa ${c}`}
                  aria-pressed={currentCurrency === c}
                  className={`px-3.5 py-2.5 min-h-[44px] rounded-none text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center ${
                    currentCurrency === c
                      ? "bg-accent text-accent-contrast"
                      : "text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
