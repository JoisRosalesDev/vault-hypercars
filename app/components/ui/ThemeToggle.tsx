"use client";

import React from "react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div role="group" aria-label="Selector de tema de telemetría" className="inline-flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-none select-none">
      <button
        type="button"
        onClick={() => theme !== "cyan" && toggleTheme()}
        aria-pressed={theme === "cyan"}
        className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors duration-150 cursor-pointer ${
          theme === "cyan"
            ? "bg-accent text-accent-contrast shadow-[0_0_10px_var(--color-accent-glow)]"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
        aria-label="Modo Cyan Eléctrico"
      >
        CYAN
      </button>
      <button
        type="button"
        onClick={() => theme !== "corsa" && toggleTheme()}
        aria-pressed={theme === "corsa"}
        className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors duration-150 cursor-pointer ${
          theme === "corsa"
            ? "bg-accent text-accent-contrast shadow-[0_0_10px_var(--color-accent-glow)]"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
        aria-label="Modo Rojo Corsa"
      >
        CORSA
      </button>
    </div>
  );
}

export default ThemeToggle;
