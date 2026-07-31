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
      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">VALOR INVENTARIO TOTAL</span>
        <div className="text-3xl font-black text-white">${inventoryInMillions}M USD</div>
        <span className="text-[11px] text-emerald-400 mt-2 block font-medium">Incremento de inventario activo</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">UNIDADES ACTIVAS</span>
        <div className="text-3xl font-black text-[#f5d061]">{activeUnitsCount} AUTOS</div>
        <span className="text-[11px] text-zinc-400 mt-2 block font-medium">Bugatti • Lamborghini • Ferrari</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">VENTAS DEL MES</span>
        <div className="text-3xl font-black text-white">${revenueInMillions}M USD</div>
        <span className="text-[11px] text-emerald-400 mt-2 block font-medium">Ingresos de órdenes completadas</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">TASA DE CONVERSIÓN VIP</span>
        <div className="text-3xl font-black text-[#d4af37]">{conversionRate}%</div>
        <span className="text-[11px] text-zinc-400 mt-2 block font-medium">Clientes de alta fidelidad</span>
      </div>
    </section>
  );
}

export default DashboardAnalytics;
