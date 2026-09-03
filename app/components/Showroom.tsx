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
      {/* Radial Dynamic Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-none pointer-events-none transition-all duration-700 opacity-20"
        style={{
          background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)"
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-zinc-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-accent/10 border border-accent/30 text-xs font-mono font-bold text-accent tracking-widest mb-3 uppercase">
            <SparklesIcon className="w-3.5 h-3.5" /> BUGATTI • LAMBORGHINI • FERRARI
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase">
            SHOWROOM VIRTUAL VIP
          </h2>
        </div>

        {/* Model Switcher */}
        <div className="flex flex-wrap gap-2">
          {hypercars.map((car) => (
            <button
              key={car.id}
              onClick={() => setSelectedCar(car)}
              className={`px-4 py-2 rounded-none text-xs font-mono font-bold tracking-wider transition-all duration-150 border cursor-pointer uppercase ${
                selectedCar.id === car.id
                  ? "bg-accent text-accent-contrast border-accent shadow-[0_0_15px_var(--color-accent-glow)]"
                  : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
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
        <div className="lg:col-span-7 rounded-none sm:rounded-sm bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden group backdrop-blur-xl hover:border-zinc-700 transition-all">
          <div className="flex justify-between items-start z-10">
            <span className="px-3 py-1 rounded-none bg-accent/10 border border-accent/30 text-accent text-[10px] font-mono font-bold tracking-widest uppercase">
              {selectedCar.badge}
            </span>

            <button
              onClick={() => setIsPlayingSound(!isPlayingSound)}
              className="flex items-center gap-2 px-4 py-2 rounded-none bg-zinc-900 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 transition-all cursor-pointer hover:border-accent hover:text-accent"
            >
              {isPlayingSound ? (
                <>
                  <VolumeIcon className="w-4 h-4 text-accent animate-pulse" />
                  <span className="text-accent">SONIDO V12 ACTIVO</span>
                  <div className="flex gap-1 items-center ml-1">
                    <span className="w-1 h-3 bg-accent animate-pulse"></span>
                    <span className="w-1 h-4 bg-accent animate-pulse delay-75"></span>
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
            <div className="absolute bottom-0 w-3/4 h-24 bg-gradient-to-t from-white/5 to-transparent rounded-none blur-xl opacity-40" />
            <div className="relative z-10 w-full flex flex-col items-center justify-center py-12 px-6 rounded-none border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-transparent text-center">
              <div className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white/5 select-none uppercase">
                {selectedCar.brand}
              </div>
              <p className="text-3xl font-display font-black text-white tracking-wide mt-2 uppercase">
                {selectedCar.name}
              </p>
              <p className="text-sm font-mono text-accent tracking-widest mt-1">
                {selectedCar.subtitle}
              </p>
            </div>
          </div>

          {/* Card Footer with Add To Cart */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 border-t border-zinc-800 gap-4 z-10">
            <div>
              <div className="text-xs font-mono text-zinc-500 tracking-wider uppercase">PRECIO DE ADQUISICIÓN</div>
              <div className="text-2xl font-mono font-black text-accent tabular-nums">{formatPrice(selectedCar.priceUSD)}</div>
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
                className="flex-1 sm:flex-none px-6 py-3 bg-accent text-accent-contrast font-display font-black text-xs tracking-widest rounded-none hover:bg-accent-hover transition-all shadow-[0_0_15px_var(--color-accent-glow)] cursor-pointer flex items-center justify-center gap-2 uppercase"
              >
                <ShoppingCartIcon className="w-4 h-4" /> COMPRAR AHORA
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Specs */}
        <div className="lg:col-span-5 rounded-none sm:rounded-sm bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex gap-2 border-b border-zinc-800 pb-4 mb-6">
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-none transition-colors cursor-pointer uppercase ${
                  activeTab === "specs" ? "bg-accent text-accent-contrast shadow-[0_0_10px_var(--color-accent-glow)]" : "text-zinc-500 hover:text-white"
                }`}
              >
                ESPECIFICACIONES
              </button>
              <button
                onClick={() => setActiveTab("aerodynamics")}
                className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-none transition-colors cursor-pointer uppercase ${
                  activeTab === "aerodynamics" ? "bg-accent text-accent-contrast shadow-[0_0_10px_var(--color-accent-glow)]" : "text-zinc-500 hover:text-white"
                }`}
              >
                AERODINÁMICA
              </button>
            </div>

            {activeTab === "specs" && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-mono font-semibold text-zinc-500 tracking-widest uppercase">Motorización</p>
                  <p className="text-sm font-mono font-bold text-white mt-1">{selectedCar.engine}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                  <div className="p-4 rounded-none bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                      <ZapIcon className="w-3.5 h-3.5 text-accent" /> Potencia
                    </div>
                    <div className="text-2xl font-mono font-black text-white tabular-nums">{selectedCar.hp}</div>
                  </div>

                  <div className="p-4 rounded-none bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                      <FlameIcon className="w-3.5 h-3.5 text-accent" /> 0-100 KM/H
                    </div>
                    <div className="text-2xl font-mono font-black text-accent tabular-nums">{selectedCar.acceleration}</div>
                  </div>
                </div>

                <div className="p-4 rounded-none bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                    <GaugeIcon className="w-3.5 h-3.5 text-accent" /> Velocidad Máxima
                  </div>
                  <div className="text-2xl font-mono font-black text-white tabular-nums">{selectedCar.topSpeed}</div>
                </div>

                <p className="text-xs font-mono text-zinc-400 leading-relaxed pt-2">
                  {selectedCar.description}
                </p>
              </div>
            )}

            {activeTab === "aerodynamics" && (
              <div className="space-y-4">
                <div className="p-4 rounded-none bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-mono text-accent font-bold block mb-1 uppercase">MONOCASCO DE FIBRA DE CARBONO</span>
                  <p className="text-xs font-mono text-zinc-300">
                    Estructura ultraligera fabricada con estándares de la industria aeroespacial.
                  </p>
                </div>

                <div className="p-4 rounded-none bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-mono text-accent font-bold block mb-1 uppercase">CARGA AERODINÁMICA ACTIVA</span>
                  <p className="text-xs font-mono text-zinc-300">
                    Sistemas de alerones inteligentes que se ajustan en milisegundos en curvas de alta velocidad.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center gap-3 text-xs font-mono text-zinc-400">
            <ShieldCheckIcon className="w-5 h-5 text-accent shrink-0" />
            <span>Disponibilidad limitada a <strong>{selectedCar.units}</strong>.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
