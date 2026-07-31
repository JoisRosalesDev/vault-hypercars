"use client";

import React from "react";
import { CatalogItem } from "../../types/catalog";
import { useHypercarCart } from "../../hooks/useHypercarCart";
import { ShoppingCartIcon, CloseIcon } from "../ui/Icons";

export interface CatalogModalProps {
  item: CatalogItem | null;
  onClose: () => void;
  onAddToCart?: (item: CatalogItem) => void;
}

export function CatalogModal({ item, onClose, onAddToCart }: CatalogModalProps) {
  const { addToCart, setIsCartOpen, formatPrice } = useHypercarCart();

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
      <div className="w-full max-w-lg rounded-2xl bg-[#0e0e14] border border-white/20 p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white text-xs font-bold tracking-widest cursor-pointer flex items-center gap-1"
        >
          <CloseIcon className="w-4 h-4" /> CERRAR
        </button>

        <span className="px-3 py-1 rounded bg-[#d4af37]/20 text-[#f5d061] text-[10px] font-bold tracking-widest uppercase">
          MARCA: {item.brand}
        </span>

        {item.image && (
          <div className="my-4 rounded-xl overflow-hidden max-h-48">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}

        <h3 className="text-3xl font-extrabold text-white mt-3 mb-1">{item.name}</h3>
        <p className="text-xs text-zinc-400 mb-6">{item.description}</p>

        <div className="space-y-4 py-4 border-y border-white/10 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Potencia del Motor:</span>
            <span className="font-bold text-white">{item.power}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Velocidad Máxima:</span>
            <span className="font-bold text-[#f5d061]">{item.topSpeed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Año de Fabricación:</span>
            <span className="font-bold text-white">{item.year}</span>
          </div>
          {item.specs?.acceleration && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Aceleración (0-100 km/h):</span>
              <span className="font-bold text-[#f5d061]">{item.specs.acceleration}</span>
            </div>
          )}
          {item.specs?.engine && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Motorización:</span>
              <span className="font-bold text-white">{item.specs.engine}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Precio Oficial:</span>
            <span className="font-bold text-white">{formatPrice(item.priceUSD)}</span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-4 bg-[#d4af37] text-black text-xs font-extrabold tracking-[0.2em] rounded hover:bg-[#f5d061] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center justify-center gap-2"
        >
          <ShoppingCartIcon className="w-4 h-4" /> COMPRAR AHORA Y AÑADIR AL CARRITO
        </button>
      </div>
    </div>
  );
}

export default CatalogModal;
