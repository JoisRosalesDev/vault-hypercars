"use client";

import React from "react";
import { DashboardMetrics } from "../../types/admin";

export interface DashboardAnalyticsProps {
  metrics: DashboardMetrics;
}

export function DashboardAnalytics({ metrics }: DashboardAnalyticsProps) {
  const { totalInventoryUSD, activeUnitsCount, monthlyRevenueUSD, conversionRate } = metrics;
  const inventoryInMillions = (totalInventoryUSD / 1000000).toFixed(2);
  const revenueInMillions = (monthlyRevenueUSD / 1000000).toFixed(1);

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="p-6 rounded-none sm:rounded-sm bg-zinc-900/50 backdrop-blur-md border border-zinc-800 hover:border-accent/40 transition-colors duration-150">
        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase block mb-2">VALOR INVENTARIO TOTAL</span>
        <div className="text-3xl font-mono font-black text-white tabular-nums">${inventoryInMillions}M USD</div>
        <span className="text-[10px] font-mono text-emerald-400 mt-2 block font-semibold tracking-wider">INCREMENTO DE INVENTARIO ACTIVO</span>
      </div>

      <div className="p-6 rounded-none sm:rounded-sm bg-zinc-900/50 backdrop-blur-md border border-zinc-800 hover:border-accent/40 transition-colors duration-150">
        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase block mb-2">UNIDADES ACTIVAS</span>
        <div className="text-3xl font-mono font-black text-accent tabular-nums">{activeUnitsCount} AUTOS</div>
        <span className="text-[10px] font-mono text-zinc-400 mt-2 block font-medium tracking-wider">BUGATTI // LAMBORGHINI // FERRARI</span>
      </div>

      <div className="p-6 rounded-none sm:rounded-sm bg-zinc-900/50 backdrop-blur-md border border-zinc-800 hover:border-accent/40 transition-colors duration-150">
        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase block mb-2">VENTAS DEL MES</span>
        <div className="text-3xl font-mono font-black text-white tabular-nums">${revenueInMillions}M USD</div>
        <span className="text-[10px] font-mono text-emerald-400 mt-2 block font-semibold tracking-wider">ÓRDENES COMPLETADAS</span>
      </div>

      <div className="p-6 rounded-none sm:rounded-sm bg-zinc-900/50 backdrop-blur-md border border-zinc-800 hover:border-accent/40 transition-colors duration-150">
        <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase block mb-2">TASA DE CONVERSIÓN VIP</span>
        <div className="text-3xl font-mono font-black text-accent tabular-nums">{conversionRate}%</div>
        <span className="text-[10px] font-mono text-zinc-400 mt-2 block font-medium tracking-wider">CLIENTES DE ALTA FIDELIDAD</span>
      </div>
    </section>
  );
}

export default DashboardAnalytics;
