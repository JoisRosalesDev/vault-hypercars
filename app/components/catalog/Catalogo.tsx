"use client";

import React, { useState, useEffect } from "react";
import { CatalogItem, Brand, ItemStatus } from "../../types/catalog";
import { CatalogFilter } from "./CatalogFilter";
import { CatalogGrid } from "./CatalogGrid";
import { CatalogModal } from "./CatalogModal";
import { SparklesIcon } from "../ui/Icons";

export function mapToCatalogItem(car: Record<string, unknown>): CatalogItem {
  const hp = typeof car.hp === "number" ? car.hp : null;
  const powerStr = hp ? `${hp.toLocaleString()} HP` : (typeof car.power === "string" ? car.power : "N/A");

  return {
    id: String(car.id || ""),
    name: String(car.name || ""),
    brand: (car.brand as Brand) || "Bugatti",
    year: String(car.year || ""),
    power: powerStr,
    topSpeed: String(car.topSpeed || ""),
    priceUSD: Number(car.price ?? car.priceUSD ?? 0),
    status: (car.status as ItemStatus) || "Disponible",
    stock: Number(car.stock ?? 0),
    description: String(car.description || ""),
    image: String(car.image || ""),
    specs: {
      power: powerStr,
      topSpeed: String(car.topSpeed || ""),
      acceleration: car.acceleration ? String(car.acceleration) : undefined,
      engine: car.engine ? String(car.engine) : undefined
    }
  };
}

export function Catalogo() {
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = selectedBrand !== "all"
          ? `/api/catalog?brand=${encodeURIComponent(selectedBrand)}`
          : `/api/catalog`;
        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          const mapped = Array.isArray(data) ? data.map(mapToCatalogItem) : [];
          setItems(mapped);
        }
      } catch (err: unknown) {
        console.error("[Catalogo Fetch Error]:", err);
        if (isMounted) {
          setError((err as Error).message || "No se pudo obtener el catálogo de vehículos.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, [selectedBrand]);

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
