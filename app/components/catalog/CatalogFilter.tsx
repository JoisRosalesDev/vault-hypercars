"use client";

import React from "react";

export interface CatalogFilterProps {
  selectedBrand: string;
  onSelectBrand: (brandId: string) => void;
}

export function CatalogFilter({ selectedBrand, onSelectBrand }: CatalogFilterProps) {
  const tabs = [
    { id: "all", label: "TODAS LAS MARCAS" },
    { id: "Bugatti", label: "BUGATTI" },
    { id: "Lamborghini", label: "LAMBORGHINI" },
    { id: "Ferrari", label: "FERRARI" }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectBrand(tab.id)}
          className={`px-5 py-2.5 rounded text-xs font-bold tracking-wider transition-all border cursor-pointer ${
            selectedBrand.toLowerCase() === tab.id.toLowerCase()
              ? "bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-105"
              : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default CatalogFilter;
