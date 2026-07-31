"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { SparklesIcon, VolumeIcon, VolumeMuteIcon, ShoppingCartIcon, ZapIcon, FlameIcon, GaugeIcon, ShieldCheckIcon } from "./Icons";

interface Hypercar {
  id: string;
  brand: "Bugatti" | "Lamborghini" | "Ferrari";
  name: string;
  subtitle: string;
  hp: string;
  acceleration: string;
  topSpeed: string;
  engine: string;
  priceUSD: number;
  badge: string;
  units: string;
  description: string;
}

const hypercars: Hypercar[] = [
  {
    id: "bugatti-tourbillon",
    brand: "Bugatti",
    name: "BUGATTI TOURBILLON",
    subtitle: "El Mito Reinventado con V16 Atmosférico",
    hp: "1,800 HP",
    acceleration: "2.00 s",
    topSpeed: "445 km/h",
    engine: "V16 8.3L Atmosférico + 3 Motores Eléctricos",
    priceUSD: 4100000,
    badge: "EDICIÓN LIMITADA A 250 U",
    units: "250 unidades a nivel mundial",
    description: "Cuadro de instrumentos analógico diseñado por relojeros suizos con engranajes de titanio y cristal de zafiro. Aerodinámica integrada sin alerón expuesto."
  },
  {
    id: "lamborghini-revuelto",
    brand: "Lamborghini",
    name: "LAMBORGHINI REVUELTO",
    subtitle: "V12 Híbrido Enchufable High Performance EV",
    hp: "1,015 HP",
    acceleration: "2.50 s",
    topSpeed: "350 km/h",
    engine: "V12 6.5L Atmosférico + 3 Motores Eléctricos",
    priceUSD: 600000,
    badge: "TECNOLOGÍA HPEV INSIGNIA",
    units: "Asignación exclusiva bajo cuota",
    description: "Monofuselaje de carbono forjado de nueva generación. Transmisión de doble embrague de 8 velocidades montada transversalmente."
  },
  {
    id: "ferrari-daytona-sp3",
    brand: "Ferrari",
    name: "FERRARI DAYTONA SP3",
    subtitle: "La Leyenda Icona de Maranello",
    hp: "840 HP",
    acceleration: "2.85 s",
    topSpeed: "340 km/h",
    engine: "V12 6.5L Atmosférico a 9,500 RPM",
    priceUSD: 2250000,
    badge: "SERIE ICONA 1-OF-599",
    units: "599 unidades numeradas",
    description: "Homenaje aerodinámico a los legendarios prototipos deportivos de las 24 Horas de Daytona de 1967. Chasis de composite compuesto de fibra de carbono T1000."
  }
];

export default function Showroom() {
  const [selectedCar, setSelectedCar] = useState<Hypercar>(hypercars[0]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "aerodynamics">("specs");
  const { addToCart, formatPrice, setIsCartOpen } = useCart();

  return (
    <section id="showroom" className="relative py-28 px-8 max-w-7xl mx-auto w-full z-10">
      {/* Lighting Glow Accent */}
      <div 
        className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 blur-3xl opacity-30"
        style={{
          background: selectedCar.brand === "Bugatti" 
            ? "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)"
            : selectedCar.brand === "Lamborghini"
            ? "radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)"
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#f5d061] tracking-widest mb-3">
            <SparklesIcon className="w-3.5 h-3.5" /> BUGATTI • LAMBORGHINI • FERRARI
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            SHOWROOM VIRTUAL VIP
          </h2>
        </div>

        {/* Model Switcher */}
        <div className="flex flex-wrap gap-3">
          {hypercars.map((car) => (
            <button
              key={car.id}
              onClick={() => setSelectedCar(car)}
              className={`px-5 py-2.5 rounded text-xs font-bold tracking-wider transition-all duration-300 border cursor-pointer ${
                selectedCar.id === car.id
                  ? "bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {car.brand.toUpperCase()} — {car.name.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column Stage */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0d0d12]/80 border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group backdrop-blur-xl hover:border-white/20 transition-all">
          <div className="flex justify-between items-start z-10">
            <span className="px-3 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f5d061] text-[10px] font-extrabold tracking-widest">
              {selectedCar.badge}
            </span>

            <button
              onClick={() => setIsPlayingSound(!isPlayingSound)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
            >
              {isPlayingSound ? (
                <>
                  <VolumeIcon className="w-4 h-4 text-[#f5d061] animate-pulse" />
                  <span className="text-[#f5d061]">SONIDO V12 ACTIVO</span>
                  <div className="flex gap-1 items-center ml-1">
                    <span className="w-1 h-3 bg-[#f5d061] animate-pulse"></span>
                    <span className="w-1 h-4 bg-[#f5d061] animate-pulse delay-75"></span>
                  </div>
                </>
              ) : (
                <>
                  <VolumeMuteIcon className="w-4 h-4 text-zinc-500" />
                  <span>SIMULAR SONIDO MOTOR</span>
                </>
              )}
            </button>
          </div>

          {/* Hypercar Stage Pedestal */}
          <div className="my-12 relative flex flex-col items-center justify-center min-h-[320px]">
            <div className="absolute bottom-0 w-3/4 h-24 bg-gradient-to-t from-white/10 to-transparent rounded-[100%] blur-xl opacity-60" />
            <div className="relative z-10 w-full flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent text-center hover:scale-[1.02] transition-transform duration-500">
              <div className="text-5xl md:text-7xl font-black tracking-tighter text-white/10 select-none uppercase">
                {selectedCar.brand}
              </div>
              <p className="text-3xl font-black text-white tracking-wide mt-2">
                {selectedCar.name}
              </p>
              <p className="text-sm text-[#f5d061] tracking-widest mt-1">
                {selectedCar.subtitle}
              </p>
            </div>
          </div>

          {/* Card Footer with Add To Cart */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t border-white/10 gap-4 z-10">
            <div>
              <div className="text-xs text-zinc-500 tracking-wider">PRECIO DE ADQUISICIÓN</div>
              <div className="text-2xl font-black text-white">{formatPrice(selectedCar.priceUSD)}</div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  addToCart({
                    id: selectedCar.id,
                    name: selectedCar.name,
                    brand: selectedCar.brand,
                    priceUSD: selectedCar.priceUSD,
                    image: ""
                  });
                  setIsCartOpen(true);
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-[#d4af37] text-black font-extrabold text-xs tracking-widest rounded hover:bg-[#f5d061] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon className="w-4 h-4" /> COMPRAR AHORA
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Specs */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0e0e14]/90 border border-white/10 p-8 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex gap-2 border-b border-white/10 pb-4 mb-6">
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-4 py-2 text-xs font-bold tracking-wider rounded transition-colors cursor-pointer ${
                  activeTab === "specs" ? "bg-white/10 text-[#f5d061]" : "text-zinc-500 hover:text-white"
                }`}
              >
                ESPECIFICACIONES
              </button>
              <button
                onClick={() => setActiveTab("aerodynamics")}
                className={`px-4 py-2 text-xs font-bold tracking-wider rounded transition-colors cursor-pointer ${
                  activeTab === "aerodynamics" ? "bg-white/10 text-[#f5d061]" : "text-zinc-500 hover:text-white"
                }`}
              >
                AERODINÁMICA
              </button>
            </div>

            {activeTab === "specs" && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 tracking-widest uppercase">Motorización</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedCar.engine}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                      <ZapIcon className="w-3.5 h-3.5 text-[#f5d061]" /> Potencia
                    </div>
                    <div className="text-2xl font-black text-white">{selectedCar.hp}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                      <FlameIcon className="w-3.5 h-3.5 text-[#f5d061]" /> 0-100 KM/H
                    </div>
                    <div className="text-2xl font-black text-[#f5d061]">{selectedCar.acceleration}</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                    <GaugeIcon className="w-3.5 h-3.5 text-[#f5d061]" /> Velocidad Máxima
                  </div>
                  <div className="text-2xl font-black text-white">{selectedCar.topSpeed}</div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                  {selectedCar.description}
                </p>
              </div>
            )}

            {activeTab === "aerodynamics" && (
              <div className="space-y-4">
                <div className="p-4 rounded bg-white/5 border border-white/10">
                  <span className="text-xs text-[#f5d061] font-bold block mb-1">MONOCASCO DE FIBRA DE CARBONO</span>
                  <p className="text-xs text-zinc-300">
                    Estructura ultraligera fabricada con estándares de la industria aeroespacial.
                  </p>
                </div>

                <div className="p-4 rounded bg-white/5 border border-white/10">
                  <span className="text-xs text-[#f5d061] font-bold block mb-1">CARGA AERODINÁMICA ACTIVA</span>
                  <p className="text-xs text-zinc-300">
                    Sistemas de alerones inteligentes que se ajustan en milisegundos en curvas de alta velocidad.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-zinc-400">
            <ShieldCheckIcon className="w-5 h-5 text-[#d4af37] shrink-0" />
            <span>Disponibilidad limitada a <strong>{selectedCar.units}</strong>.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
