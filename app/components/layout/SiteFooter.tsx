"use client";

import React from "react";
import Link from "next/link";
import { LockIcon } from "../ui/Icons";

export function SiteFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-[#060608]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-xs text-zinc-500 tracking-wider">
          © 2026 Vault Hypercars. Concesionario oficial de híper deportivos de lujo.
        </p>

        <div className="flex items-center gap-6">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-white/10 bg-white/5 text-zinc-300 text-xs font-semibold tracking-widest hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            <LockIcon className="w-3.5 h-3.5 text-[#f5d061]" /> ACCESO ADMIN
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
