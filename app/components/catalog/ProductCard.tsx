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
    <div className="rounded-2xl bg-gradient-to-b from-[#0e0e14] via-[#0b0b10] to-[#08080a] border border-white/10 p-6 sm:p-7 hover:border-[#d4af37]/60 transition-all duration-300 flex flex-col justify-between group backdrop-blur-xl hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)] hover:-translate-y-1.5">
      <div>
        {/* Brand Badge & Availability Status */}
        <div className="flex justify-between items-center mb-5">
          <span className="px-3 py-1 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 text-[10px] font-extrabold text-[#f5d061] tracking-[0.2em] uppercase shadow-[0_0_10px_rgba(212,175,55,0.1)]">
            {item.brand}
          </span>

          <span
            className={`text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              item.stock > 1
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : item.stock === 1
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.stock > 1
                  ? "bg-emerald-400"
                  : item.stock === 1
                  ? "bg-amber-400 animate-pulse"
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
        <div className="w-full h-44 rounded-xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 flex flex-col items-center justify-center mb-6 group-hover:scale-[1.02] group-hover:border-[#d4af37]/30 transition-all duration-300 overflow-hidden relative shadow-inner">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <span className="text-3xl font-black text-white/10 uppercase tracking-[0.25em] select-none">
                {item.brand}
              </span>
              <span className="text-xs font-extrabold text-zinc-300 mt-1 tracking-wider">
                {item.name}
              </span>
            </div>
          )}
        </div>

        {/* Vehicle Name & Year */}
        <h3 className="text-xl font-black text-white group-hover:text-[#f5d061] transition-colors duration-200 mb-1 tracking-tight">
          {item.name}
        </h3>
        <p className="text-[11px] font-semibold text-zinc-500 tracking-[0.15em] uppercase mb-5">
          MODELO {item.year}
        </p>

        {/* Spec Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-3.5 border-y border-white/10 mb-6 bg-white/[0.02] px-3 rounded-lg">
          <div>
            <div className="text-[9px] font-bold text-zinc-400 tracking-[0.15em] uppercase">POTENCIA</div>
            <div className="text-base sm:text-lg font-black text-white">{item.power}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-zinc-400 tracking-[0.15em] uppercase">VELOCIDAD MÁX.</div>
            <div className="text-base sm:text-lg font-black text-[#f5d061]">{item.topSpeed}</div>
          </div>
        </div>
      </div>

      <div>
        {/* Price Tag */}
        <div className="mb-4 flex justify-between items-baseline">
          <span className="text-[10px] font-bold text-zinc-400 tracking-[0.15em] uppercase">PRECIO</span>
          <span className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            {formattedPrice}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => onAddToCart(item)}
            disabled={item.stock === 0}
            className={`flex-1 py-3.5 text-xs font-extrabold tracking-[0.15em] rounded transition-all duration-200 flex items-center justify-center gap-2 ${
              item.stock === 0
                ? "bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60"
                : "bg-[#d4af37] text-black hover:bg-[#f5d061] active:scale-[0.97] shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(245,208,97,0.4)] cursor-pointer"
            }`}
          >
            <ShoppingCartIcon className="w-4 h-4" /> {item.stock === 0 ? "AGOTADO" : "AÑADIR AL CARRITO"}
          </button>
          <button
            onClick={() => onInspectItem(item)}
            className="px-4 py-3.5 rounded bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 active:scale-[0.95] text-white text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center"
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
