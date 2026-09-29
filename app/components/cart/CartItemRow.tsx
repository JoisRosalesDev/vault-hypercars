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
    <div className="p-4 rounded-none bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-4 hover:border-accent/40 transition-all">
      <div className="flex items-center gap-3">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-none object-cover border border-zinc-800" />
        ) : (
          <div className="w-12 h-12 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-400">
            {item.brand}
          </div>
        )}
        <div>
          <span className="text-[10px] font-mono font-bold text-accent tracking-widest uppercase">
            {item.brand}
          </span>
          <h4 className="text-sm font-display font-bold text-white mt-0.5">{item.name}</h4>
          <p className="text-xs font-mono text-zinc-400 mt-1 tabular-nums">
            {formattedPrice} x {item.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onQuantityChange && (
          <div className="flex items-center border border-zinc-800 rounded-none bg-zinc-950 font-mono">
            <button
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              aria-label={`Disminuir cantidad de ${item.brand} ${item.name}`}
              className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
            >
              -
            </button>
            <span className="px-2 text-xs font-bold text-white tabular-nums">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              aria-label={`Aumentar cantidad de ${item.brand} ${item.name}`}
              className="px-2 py-0.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Eliminar ${item.brand} ${item.name} del carrito`}
          className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-none bg-rose-500/10 border border-rose-500/30 cursor-pointer font-mono font-semibold uppercase"
        >
          ELIMINAR
        </button>
      </div>
    </div>
  );
}

export default CartItemRow;
