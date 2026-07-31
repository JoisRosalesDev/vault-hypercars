"use client";

import React from "react";
import { CatalogItem } from "../../types/catalog";
import { ProductCard } from "./ProductCard";
import { useHypercarCart } from "../../hooks/useHypercarCart";
import { AlertTriangleIcon } from "../ui/Icons";

export interface CatalogGridProps {
  items: CatalogItem[];
  isLoading?: boolean;
  error?: string | null;
  onAddToCart?: (item: CatalogItem) => void;
  onInspectItem: (item: CatalogItem) => void;
}

export function CatalogGrid({ items, isLoading = false, error = null, onAddToCart, onInspectItem }: CatalogGridProps) {
  const { addToCart, setIsCartOpen, formatPrice } = useHypercarCart();

  const handleAdd = (item: CatalogItem) => {
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
      setIsCartOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="rounded-2xl bg-[#0e0e14]/60 border border-white/5 p-6 animate-pulse space-y-4">
            <div className="w-full h-48 bg-white/5 rounded-xl"></div>
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="h-6 bg-white/10 rounded w-2/3"></div>
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="h-6 bg-white/10 rounded w-1/4"></div>
              <div className="h-9 bg-white/10 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3 my-8">
        <AlertTriangleIcon className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Error al cargar el catálogo</h3>
        <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#0e0e14] border border-white/10">
        <p className="text-zinc-400 text-sm">No se encontraron vehículos disponibles en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          formattedPrice={formatPrice(item.priceUSD)}
          onAddToCart={handleAdd}
          onInspectItem={onInspectItem}
        />
      ))}
    </div>
  );
}

export default CatalogGrid;
