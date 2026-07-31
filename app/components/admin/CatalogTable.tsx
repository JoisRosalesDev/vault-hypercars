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
    <section className="p-8 rounded-2xl bg-[#0e0e14] border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">GESTIÓN DE CATÁLOGO ACTIVO</h2>
        <button
          onClick={onOpenCreate}
          className="px-6 py-3 bg-[#d4af37] text-black font-extrabold text-xs tracking-wider rounded hover:bg-[#f5d061] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          + NUEVO HIPERAUTO
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-white/10 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-bold text-white">
                  <span className="text-xs text-[#f5d061] block">{item.brand}</span>
                  {item.name}
                </td>
                <td className="py-4 px-4">{item.year}</td>
                <td className="py-4 px-4 font-semibold">{item.power}</td>
                <td className="py-4 px-4 font-bold text-[#f5d061]">${item.priceUSD.toLocaleString()}</td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold border ${
                      item.stock === 0
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {item.stock} u.
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    onClick={() => onOpenEdit(item)}
                    className="px-4 py-1.5 rounded text-xs bg-white/10 hover:bg-[#d4af37] hover:text-black text-white font-bold transition-all cursor-pointer border border-white/10"
                  >
                    EDITAR INFORMACIÓN
                  </button>
                  <button
                    onClick={() => onRequestDelete(item)}
                    className="px-3 py-1.5 rounded text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold cursor-pointer"
                  >
                    Eliminar
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
