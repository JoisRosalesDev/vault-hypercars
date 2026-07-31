"use client";

import React from "react";
import { CartItem } from "../../types/cart";

export interface CartItemRowProps {
  item: CartItem;
  formattedPrice: string;
  onRemove: (id: string) => void;
  onQuantityChange?: (id: string, newQuantity: number) => void;
}

export function CartItemRow({
  item,
  formattedPrice,
  onRemove,
  onQuantityChange
}: CartItemRowProps) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 hover:border-[#d4af37]/40 transition-all">
      <div className="flex items-center gap-3">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-white/10" />
        ) : (
          <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-400">
            {item.brand}
          </div>
        )}
        <div>
          <span className="text-[10px] font-bold text-[#f5d061] tracking-widest uppercase">
            {item.brand}
          </span>
          <h4 className="text-sm font-bold text-white mt-0.5">{item.name}</h4>
          <p className="text-xs text-zinc-400 mt-1">
            {formattedPrice} x {item.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onQuantityChange && (
          <div className="flex items-center border border-white/10 rounded bg-black/40">
            <button
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
            >
              -
            </button>
            <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={() => onRemove(item.id)}
          className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 cursor-pointer font-semibold"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default CartItemRow;
