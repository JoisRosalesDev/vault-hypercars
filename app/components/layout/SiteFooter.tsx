"use client";

import React from "react";
import Link from "next/link";
import { LockIcon } from "../ui/Icons";

export function SiteFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-xs font-mono text-zinc-500 tracking-wider">
          © 2026 VAULT HYPERCARS // CONCESIONARIO OFICIAL DE HÍPER DEPORTIVOS DE LUJO.
        </p>

        <div className="flex items-center gap-6">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs font-mono font-bold tracking-widest hover:border-accent hover:text-accent hover:shadow-[0_0_12px_var(--color-accent-glow)] transition-all duration-150"
          >
            <LockIcon className="w-3.5 h-3.5 text-accent" /> ACCESO ADMIN
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
