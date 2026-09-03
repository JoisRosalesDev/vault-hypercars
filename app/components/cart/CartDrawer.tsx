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
    totalUSD
  } = useHypercarCart();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const payload = {
        items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
        idempotencyKey,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar la sesión de Stripe Checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se obtuvo la URL de redirección de Stripe.");
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error).message;
      console.error("[Checkout Error]:", err);
      setCheckoutError(errorMsg || "Ocurrió un error al iniciar la compra.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
      {/* Backdrop overlay */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      {/* Cart Drawer Panel */}
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl relative z-10 animate-slideLeft">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
            <div className="flex items-center gap-3 text-white">
              <ShoppingCartIcon className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-display font-black tracking-wider uppercase">CARRITO DE COMPRAS</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-zinc-400 hover:text-accent hover:border-accent text-xs font-mono font-bold tracking-widest px-2.5 py-1.5 border border-zinc-800 rounded-none cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <CloseIcon className="w-3.5 h-3.5" /> CERRAR
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center justify-between mb-6 p-3 rounded-none bg-zinc-900/40 border border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 font-medium tracking-wider">DIVISA DE PAGO:</span>
            <div className="flex gap-1">
              {(["USD", "EUR", "GBP", "AED"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded-none text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    currency === c ? "bg-accent text-accent-contrast shadow-[0_0_10px_var(--color-accent-glow)]" : "text-zinc-400 hover:text-white"
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
              <CarIcon className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-sm font-display font-bold text-zinc-300 uppercase tracking-wider">Tu carrito de hiperautos está vacío</p>
              <p className="text-xs font-mono text-zinc-500 mt-1">Explora el catálogo de Bugatti, Lamborghini y Ferrari.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
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
          <div className="pt-6 border-t border-zinc-800 space-y-4">
            {checkoutError && (
              <div className="p-3 rounded-none bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {checkoutError}
              </div>
            )}
            <div className="flex justify-between items-end">
              <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">TOTAL A PAGAR:</span>
              <span className="text-2xl font-mono font-black text-accent tabular-nums">{formatPrice(totalUSD)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-4 bg-accent text-accent-contrast text-xs font-display font-black tracking-[0.2em] rounded-none transition-all shadow-[0_0_20px_var(--color-accent-glow)] flex items-center justify-center gap-2 uppercase ${
                isProcessing ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-hover active:scale-[0.98] cursor-pointer"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  PROCESANDO PAGO...
                </>
              ) : (
                "FINALIZAR COMPRA VIP"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
