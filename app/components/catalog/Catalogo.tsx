"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CatalogItem } from "../../types/catalog";
import { CatalogFilter } from "./CatalogFilter";
import { CatalogGrid } from "./CatalogGrid";
import { CatalogModal } from "./CatalogModal";
import { SparklesIcon } from "../ui/Icons";

export function mapToCatalogItem(car: any): CatalogItem {
  return {
    id: car.id,
    name: car.name,
    brand: car.brand,
    year: String(car.year),
    power: car.hp ? `${car.hp.toLocaleString()} HP` : (car.power || "N/A"),
    topSpeed: car.topSpeed,
    priceUSD: Number(car.price ?? car.priceUSD ?? 0),
    status: car.status,
    description: car.description || "",
    image: car.image || "",
    specs: {
      power: car.hp ? `${car.hp.toLocaleString()} HP` : (car.power || "N/A"),
      topSpeed: car.topSpeed,
      acceleration: car.acceleration,
      engine: car.engine
    }
  };
}

export function Catalogo() {
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (brand: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = brand !== "all" 
        ? `/api/catalog?brand=${encodeURIComponent(brand)}`
        : `/api/catalog`;
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map(mapToCatalogItem) : [];
      setItems(mapped);
    } catch (err: any) {
      console.error("[Catalogo Fetch Error]:", err);
      setError(err.message || "No se pudo obtener el catálogo de vehículos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog(selectedBrand);
  }, [selectedBrand, fetchCatalog]);

  return (
    <section id="catalogo" className="relative py-28 px-8 max-w-7xl mx-auto w-full z-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#f5d061] tracking-widest mb-3">
            <SparklesIcon className="w-3.5 h-3.5" /> CATÁLOGO EXCLUSIVO BUGATTI • LAMBORGHINI • FERRARI
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            CATÁLOGO DE COMPRA
          </h2>
        </div>

        {/* Brand Filter Buttons */}
        <CatalogFilter selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
      </div>

      {/* Grid of Catalog Cards */}
      <CatalogGrid
        items={items}
        isLoading={isLoading}
        error={error}
        onInspectItem={(item) => setSelectedItem(item)}
      />

      {/* Modal View */}
      <CatalogModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}

export default Catalogo;
