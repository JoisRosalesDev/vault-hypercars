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
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all duration-150 border cursor-pointer rounded-none ${
            selectedBrand.toLowerCase() === tab.id.toLowerCase()
              ? "bg-accent text-accent-contrast border-accent shadow-[0_0_12px_var(--color-accent-glow)]"
              : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default CatalogFilter;
