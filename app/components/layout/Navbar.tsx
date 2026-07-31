"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Currency } from "../../types/cart";
import { useHypercarCart } from "../../hooks/useHypercarCart";
import { ShoppingCartIcon, MenuIcon, CloseIcon } from "../ui/Icons";

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
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/75 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-[#f5d061] group-hover:text-white transition-colors duration-300">
            VAULT
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.4em] text-zinc-400 font-medium">
            HYPERCARS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-[0.2em] text-zinc-400">
          <Link href="/" className="text-white hover:text-[#f5d061] transition-colors">
            HOME
          </Link>
          <Link href="#catalogo" className="hover:text-white transition-colors">
            CATÁLOGO
          </Link>
        </nav>

        {/* Currency Switcher & Cart Button & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher Dropdown/Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-1">
            {(["USD", "EUR", "GBP", "AED"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                  currentCurrency === c
                    ? "bg-[#d4af37] text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenCart}
            className="relative px-4 sm:px-6 py-2.5 sm:py-3 border border-[#d4af37] text-[#f5d061] text-xs font-bold tracking-[0.2em] rounded-sm hover:bg-[#d4af37] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            <span className="hidden sm:inline">CARRITO</span>
            {count > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#f5d061] text-black font-black text-[10px] flex items-center justify-center animate-pulse">
                {count}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Abrir Menú"
          >
            {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#08080a]/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-bold tracking-widest text-white hover:text-[#f5d061] py-2 border-b border-white/5"
          >
            HOME
          </Link>
          <Link
            href="#catalogo"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-bold tracking-widest text-zinc-300 hover:text-white py-2"
          >
            CATÁLOGO DE COMPRA
          </Link>

          {/* Mobile Currency Selector */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold tracking-wider">DIVISA:</span>
            <div className="flex gap-1">
              {(["USD", "EUR", "GBP", "AED"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    handleCurrencyChange(c);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    currentCurrency === c ? "bg-[#d4af37] text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
