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
    <div className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden">
      {/* Background Loop Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 filter contrast-125 saturate-125 pointer-events-none"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Dark Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-[#08080a]/80 z-1 pointer-events-none" />

      {/* Hero Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f5d061] text-[10px] sm:text-xs font-bold tracking-[0.25em] mb-6 sm:mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#f5d061] animate-pulse"></span>
            {badgeText}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-2xl">
            {headline}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-normal mb-8 sm:mb-10 max-w-2xl drop-shadow">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-center">
            <a
              href="#catalogo"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#d4af37] text-[#08080a] text-xs font-extrabold tracking-[0.2em] rounded hover:bg-[#f5d061] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(245,208,97,0.5)] text-center cursor-pointer min-h-[48px] flex items-center justify-center"
            >
              VER COMPRA DE AUTOS
            </a>
          </div>
        </div>

        {/* Metrics / Stats Grid */}
        <div className="pt-10 sm:pt-16 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 mt-12 sm:mt-16 bg-white/[0.01] sm:bg-transparent p-4 sm:p-0 rounded-xl">
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">2,100 HP</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-zinc-400 mt-1 uppercase">POTENCIA MÁXIMA HYPER-EV</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#f5d061] tracking-tight">1.69s</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-zinc-400 mt-1 uppercase">0-100 KM/H RECORD</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">501 KM/H</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-zinc-400 mt-1 uppercase">VELOCIDAD MÁXIMA</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#d4af37] tracking-tight">3 MARCAS</div>
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-zinc-400 mt-1 uppercase">BUGATTI • LAMBORGHINI • FERRARI</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Hero;
