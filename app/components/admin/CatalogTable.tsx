"use client";

import React from "react";
import { CatalogItem } from "../../types/catalog";

export interface CatalogTableProps {
  items: CatalogItem[];
  onOpenCreate: () => void;
  onOpenEdit: (item: CatalogItem) => void;
  onRequestDelete: (item: CatalogItem) => void;
}

export function CatalogTable({
  items,
  onOpenCreate,
  onOpenEdit,
  onRequestDelete
}: CatalogTableProps) {
  return (
    <section className="p-6 sm:p-8 rounded-none sm:rounded-sm bg-zinc-950 border border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-black text-white tracking-wider">GESTIÓN DE CATÁLOGO ACTIVO</h2>
        <button
          onClick={onOpenCreate}
          className="px-5 py-2.5 bg-accent text-accent-contrast font-display font-black text-xs tracking-widest rounded-none hover:bg-accent-hover transition-all duration-150 cursor-pointer shadow-[0_0_15px_var(--color-accent-glow)]"
        >
          + NUEVO HIPERAUTO
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.25em] bg-zinc-900/40">
            <tr>
              <th className="py-4 px-4">MARCA Y MODELO</th>
              <th className="py-4 px-4">AÑO</th>
              <th className="py-4 px-4">POTENCIA</th>
              <th className="py-4 px-4">PRECIO (USD)</th>
              <th className="py-4 px-4">ESTADO</th>
              <th className="py-4 px-4">STOCK</th>
              <th className="py-4 px-4 text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors duration-150">
                <td className="py-4 px-4 font-bold text-white">
                  <span className="text-[10px] font-mono font-black text-accent tracking-widest uppercase block">{item.brand}</span>
                  {item.name}
                </td>
                <td className="py-4 px-4 font-mono text-zinc-300 tabular-nums">{item.year}</td>
                <td className="py-4 px-4 font-mono font-semibold text-zinc-200 tabular-nums">{item.power}</td>
                <td className="py-4 px-4 font-mono font-bold text-accent tabular-nums">${item.priceUSD.toLocaleString()}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold tracking-wider border ${
                      item.stock === 0
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {item.stock} u.
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    onClick={() => onOpenEdit(item)}
                    className="px-3.5 py-1.5 rounded-none text-xs font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-accent hover:text-accent hover:shadow-[0_0_10px_var(--color-accent-glow)] transition-all duration-150 cursor-pointer"
                  >
                    EDITAR INFORMACIÓN
                  </button>
                  <button
                    onClick={() => onRequestDelete(item)}
                    className="px-3 py-1.5 rounded-none text-xs font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all duration-150 cursor-pointer"
                  >
                    ELIMINAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CatalogTable;
