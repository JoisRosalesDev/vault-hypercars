"use client";

import React, { useRef } from "react";
import { CatalogItem } from "../../types/catalog";
import { useHypercarCart } from "../../hooks/useHypercarCart";
import { useAccessibleDialog } from "../../hooks/useAccessibleDialog";
import { ShoppingCartIcon, CloseIcon } from "../ui/Icons";

export interface CatalogModalProps {
  item: CatalogItem | null;
  onClose: () => void;
  onAddToCart?: (item: CatalogItem) => void;
}

export function CatalogModal({ item, onClose, onAddToCart }: CatalogModalProps) {
  const { addToCart, setIsCartOpen, formatPrice } = useHypercarCart();
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog({
    isOpen: !!item,
    onClose,
    dialogRef
  });

  if (!item) return null;

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      addToCart({
        id: item.id,
        name: item.name,
        brand: item.brand,
        priceUSD: item.priceUSD,
        image: item.image
      });
      onClose();
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-modal-title"
        className="w-full max-w-lg rounded-none sm:rounded-sm bg-zinc-950/95 border border-zinc-800 p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal de especificaciones"
          className="absolute top-6 right-6 text-zinc-400 hover:text-accent text-xs font-mono font-bold tracking-widest cursor-pointer flex items-center gap-1 transition-colors"
        >
          <CloseIcon className="w-4 h-4" /> CERRAR
        </button>

        <span className="px-2.5 py-1 rounded-none bg-accent/10 border border-accent/30 text-accent text-[10px] font-mono font-bold tracking-widest uppercase">
          MARCA: {item.brand}
        </span>

        {item.image && (
          <div className="my-4 rounded-none overflow-hidden max-h-48 border border-zinc-800">
            <img
              src={item.image}
              alt={`Fotografía detallada de ${item.brand} ${item.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h3 id="catalog-modal-title" className="text-2xl sm:text-3xl font-display font-black text-white mt-3 mb-1 uppercase tracking-tight">
          {item.name}
        </h3>
        <p className="text-xs font-mono text-zinc-400 mb-6">{item.description}</p>

        <div className="space-y-3 py-4 border-y border-zinc-800 mb-6">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-zinc-500">Potencia del Motor:</span>
            <span className="font-bold text-white tabular-nums">{item.power}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-zinc-500">Velocidad Máxima:</span>
            <span className="font-bold text-accent tabular-nums">{item.topSpeed}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-zinc-500">Año de Fabricación:</span>
            <span className="font-bold text-white tabular-nums">{item.year}</span>
          </div>
          {item.specs?.acceleration && (
            <div className="flex justify-between text-sm font-mono">
              <span className="text-zinc-500">Aceleración (0-100 km/h):</span>
              <span className="font-bold text-accent tabular-nums">{item.specs.acceleration}</span>
            </div>
          )}
          {item.specs?.engine && (
            <div className="flex justify-between text-sm font-mono">
              <span className="text-zinc-500">Motorización:</span>
              <span className="font-bold text-white">{item.specs.engine}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-mono">
            <span className="text-zinc-500">Unidades en Inventario:</span>
            <span className={`font-bold tabular-nums ${item.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {item.stock > 0 ? `${item.stock} u.` : "Agotado (0 u.)"}
            </span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-zinc-500">Precio Oficial:</span>
            <span className="font-bold text-accent tabular-nums">{formatPrice(item.priceUSD)}</span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={item.stock === 0}
          className={`w-full py-4 text-xs font-display font-black tracking-[0.2em] rounded-none transition-all flex items-center justify-center gap-2 uppercase ${
            item.stock === 0
              ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
              : "bg-accent text-accent-contrast hover:bg-accent-hover shadow-[0_0_20px_var(--color-accent-glow)] cursor-pointer"
          }`}
        >
          <ShoppingCartIcon className="w-4 h-4" /> {item.stock === 0 ? "AGOTADO" : "COMPRAR AHORA Y AÑADIR AL CARRITO"}
        </button>
      </div>
    </div>
  );
}

export default CatalogModal;
