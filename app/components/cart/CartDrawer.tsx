"use client";

import React from "react";
import { Currency } from "../../types/cart";
import { useHypercarCart } from "../../hooks/useHypercarCart";
import { CartItemRow } from "./CartItemRow";
import { ShoppingCartIcon, CloseIcon, CarIcon } from "../ui/Icons";

export function CartDrawer() {
  const {
    cart,
    currency,
    setCurrency,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    formatPrice,
    clearCart,
    totalUSD
  } = useHypercarCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
      {/* Backdrop overlay */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      {/* Cart Drawer Panel */}
      <div className="w-full max-w-md bg-[#0c0c10] border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl relative z-10 animate-slideLeft">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3 text-white">
              <ShoppingCartIcon className="w-5 h-5 text-[#f5d061]" />
              <h2 className="text-xl font-bold tracking-wide">CARRITO DE COMPRAS</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-zinc-400 hover:text-white text-xs font-bold tracking-widest px-2.5 py-1.5 border border-white/10 rounded cursor-pointer flex items-center gap-1.5"
            >
              <CloseIcon className="w-3.5 h-3.5" /> CERRAR
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center justify-between mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-zinc-400 font-medium tracking-wider">DIVISA DE PAGO:</span>
            <div className="flex gap-1">
              {(["USD", "EUR", "GBP", "AED"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    currency === c ? "bg-[#d4af37] text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Item List */}
          {cart.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 flex flex-col items-center">
              <CarIcon className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-sm font-semibold text-zinc-300">Tu carrito de hiperautos está vacío</p>
              <p className="text-xs text-zinc-500 mt-1">Explora el catálogo de Bugatti, Lamborghini y Ferrari.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {cart.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  formattedPrice={formatPrice(item.priceUSD)}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs text-zinc-400 tracking-wider">TOTAL A PAGAR:</span>
              <span className="text-2xl font-black text-[#f5d061]">{formatPrice(totalUSD)}</span>
            </div>

            <button
              onClick={() => {
                alert(`Solicitud de adquisición VIP procesada para ${formatPrice(totalUSD)}.`);
                clearCart();
                setIsCartOpen(false);
              }}
              className="w-full py-4 bg-[#d4af37] text-black text-xs font-extrabold tracking-[0.2em] rounded-md hover:bg-[#f5d061] hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              FINALIZAR COMPRA VIP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
