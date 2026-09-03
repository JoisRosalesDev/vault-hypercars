"use client";

import React from "react";
import { CatalogItem } from "../../types/catalog";
import { ShoppingCartIcon, ChevronRightIcon } from "../ui/Icons";

export interface ProductCardProps {
  item: CatalogItem;
  formattedPrice: string;
  onAddToCart: (item: CatalogItem) => void;
  onInspectItem: (item: CatalogItem) => void;
}

export function ProductCard({
  item,
  formattedPrice,
  onAddToCart,
  onInspectItem
}: ProductCardProps) {
  return (
    <div className="rounded-none sm:rounded-sm bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 sm:p-7 hover:border-accent/80 hover:shadow-[0_0_15px_var(--color-accent-glow)] transition-all duration-150 ease-out flex flex-col justify-between group">
      <div>
        {/* Brand Badge & Availability Status */}
        <div className="flex justify-between items-center mb-5">
          <span className="px-2.5 py-1 rounded-none bg-accent/10 border border-accent/30 text-[10px] font-mono font-black text-accent tracking-widest uppercase">
            {item.brand}
          </span>

          <span
            className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-none flex items-center gap-1.5 ${
              item.stock > 1
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : item.stock === 1
                ? "bg-accent/10 text-accent border border-accent/40"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.stock > 1
                  ? "bg-emerald-400"
                  : item.stock === 1
                  ? "bg-accent animate-pulse"
                  : "bg-rose-400"
              }`}
            />
            {item.stock > 1
              ? `Stock: ${item.stock} u.`
              : item.stock === 1
              ? "¡Última unidad!"
              : "AGOTADO"}
          </span>
        </div>

        {/* Graphical Emblem / Thumbnail */}
        <div className="w-full h-44 rounded-none bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center mb-6 group-hover:border-accent/40 transition-colors duration-150 overflow-hidden relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <span className="text-2xl font-display font-black text-zinc-700 uppercase tracking-[0.25em] select-none">
                {item.brand}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400 mt-1 tracking-wider">
                {item.name}
              </span>
            </div>
          )}
        </div>

        {/* Vehicle Name & Year */}
        <h3 className="text-xl font-display font-black text-white group-hover:text-accent transition-colors duration-150 mb-1 tracking-tight">
          {item.name}
        </h3>
        <p className="text-[10px] font-mono font-semibold text-zinc-500 tracking-widest uppercase mb-5">
          MODELO {item.year}
        </p>

        {/* Spec Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-800 mb-6 bg-zinc-950/40 px-3 rounded-none">
          <div>
            <div className="text-[9px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase">POTENCIA</div>
            <div className="text-base sm:text-lg font-mono font-bold text-white tabular-nums">{item.power}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase">VELOCIDAD MÁX.</div>
            <div className="text-base sm:text-lg font-mono font-bold text-accent tabular-nums">{item.topSpeed}</div>
          </div>
        </div>
      </div>

      <div>
        {/* Price Tag */}
        <div className="mb-4 flex justify-between items-baseline">
          <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase">PRECIO</span>
          <span className="text-2xl font-mono font-black text-accent tabular-nums tracking-tight">
            {formattedPrice}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(item)}
            disabled={item.stock === 0}
            className={`flex-1 py-3.5 text-xs font-display font-black tracking-[0.15em] rounded-none transition-all duration-150 ease-out flex items-center justify-center gap-2 ${
              item.stock === 0
                ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                : "bg-accent text-accent-contrast hover:bg-accent-hover active:scale-[0.98] shadow-[0_0_15px_var(--color-accent-glow)] cursor-pointer"
            }`}
          >
            <ShoppingCartIcon className="w-4 h-4" /> {item.stock === 0 ? "AGOTADO" : "AÑADIR AL CARRITO"}
          </button>
          <button
            onClick={() => onInspectItem(item)}
            className="px-4 py-3.5 rounded-none bg-zinc-900/80 border border-zinc-800 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-glow)] active:scale-[0.96] text-white text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center"
            title="Ver detalles completos"
            aria-label="Ver detalles"
          >
            <ChevronRightIcon className="w-4 h-4 text-zinc-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
