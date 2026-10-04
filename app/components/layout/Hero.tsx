"use client";

import React from "react";

export interface HeroProps {
  videoSrc?: string;
  badgeText?: string;
  headline?: string;
  description?: string;
}

export function Hero({
  videoSrc = "/Futuristic Sports Car Racing Through Illuminated Tunnel.mp4",
  badgeText = "BUGATTI • LAMBORGHINI • FERRARI",
  headline = "LA CÚSPIDE DE LA INGENIERÍA AUTOMOTRIZ",
  description = "Adquiere los hiperautos más exclusivos del planeta. Ingeniería de competición, diseño radical y velocidad pura sin compromisos."
}: HeroProps) {
  return (
    <div className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden bg-zinc-950">
      {/* Background Loop Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30 filter contrast-125 saturate-125 pointer-events-none motion-reduce:hidden"
      >
        <source src={encodeURI(videoSrc)} type="video/mp4" />
      </video>

      {/* Dark Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/80 z-1 pointer-events-none" />

      {/* Hero Content */}
      <section aria-label="Introducción" className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-accent/10 border border-accent/30 text-accent text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] mb-6 sm:mb-8 backdrop-blur-md shadow-[0_0_12px_var(--color-accent-glow)]">
            <span className="w-1.5 h-1.5 rounded-none bg-accent animate-pulse"></span>
            {badgeText}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.05] mb-6 text-white uppercase drop-shadow-2xl">
            {headline}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed font-normal mb-8 sm:mb-10 max-w-2xl">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-center">
            <a
              href="#catalogo"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-accent text-accent-contrast text-xs font-display font-black tracking-[0.2em] rounded-none hover:bg-accent-hover active:scale-95 transition-all duration-150 shadow-[0_0_20px_var(--color-accent-glow)] hover:shadow-[0_0_30px_var(--color-accent-glow)] text-center cursor-pointer min-h-[48px] flex items-center justify-center uppercase"
            >
              EXPLORAR HIPERAUTOS VIP
            </a>
          </div>
        </div>

        {/* Metrics / Stats Grid */}
        <div className="pt-10 sm:pt-14 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 mt-12 sm:mt-16 bg-zinc-900/30 sm:bg-transparent p-4 sm:p-0 rounded-none">
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-white tracking-tight tabular-nums">2,100 HP</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-500 mt-1 uppercase">POTENCIA MÁXIMA HYPER-EV</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-accent tracking-tight tabular-nums">1.69s</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-500 mt-1 uppercase">0-100 KM/H RECORD</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-white tracking-tight tabular-nums">501 KM/H</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-500 mt-1 uppercase">VELOCIDAD MÁXIMA</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-accent tracking-tight tabular-nums">3 MARCAS</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-500 mt-1 uppercase">BUGATTI // LAMBORGHINI // FERRARI</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
