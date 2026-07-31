"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LockIcon, AlertTriangleIcon } from "../../components/ui/Icons";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/admin/dashboard" });
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-md p-8 rounded-lg bg-[#0e0e12]/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f5d061] mb-4">
            <LockIcon className="w-5 h-5 text-[#f5d061]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Acceso Administrativo</h1>
          <p className="text-xs text-zinc-400 mt-1 tracking-wide">
            Panel privado de control Vault Hypercars • Autenticación Restringida
          </p>
        </div>

        {error === "AccessDenied" && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200 leading-relaxed">
              <span className="font-bold block text-rose-400">ACCESO DENEGADO</span>
              La cuenta utilizada no tiene permisos de administrador. Solo la cuenta autorizada (<code className="text-[#f5d061]">joisrosafer@gmail.com</code>) puede ingresar.
            </div>
          </div>
        )}

        <div className="space-y-5">
          <p className="text-xs text-zinc-400 text-center leading-relaxed">
            Inicie sesión con su cuenta Google verificada para acceder a la consola de administración.
          </p>

          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full py-4 bg-[#d4af37] text-black text-xs font-extrabold tracking-[0.2em] rounded hover:bg-[#f5d061] transition-all duration-200 shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            INICIAR SESIÓN CON GOOGLE
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white font-sans flex flex-col justify-between relative overflow-hidden selection:bg-[#f5d061] selection:text-black">
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(8, 8, 10, 0) 70%)"
        }}
      />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-8 py-8 flex justify-between items-center relative z-10">
        <Link href="/" className="flex flex-col group">
          <span className="text-xl font-black tracking-[0.25em] text-[#f5d061]">VAULT</span>
          <span className="text-[8px] tracking-[0.4em] text-zinc-400">HYPERCARS</span>
        </Link>

        <Link
          href="/"
          className="text-xs tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          ← VOLVER AL INICIO
        </Link>
      </header>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-xs text-zinc-500">Cargando...</div>}>
        <LoginContent />
      </Suspense>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-zinc-600 relative z-10">
        © 2026 Vault Hypercars. Autenticación de alta seguridad con Google OAuth.
      </footer>
    </div>
  );
}
