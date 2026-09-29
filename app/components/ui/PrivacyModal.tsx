"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAccessibleDialog } from "../../hooks/useAccessibleDialog";
import { PrivacyAction, PrivacyExportResponse, PrivacyDeleteResponse } from "../../types/privacy";
import { CloseIcon, LockIcon } from "./Icons";

export function PrivacyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [action, setAction] = useState<PrivacyAction>("export");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<PrivacyExportResponse | null>(null);
  const [deleteResult, setDeleteResult] = useState<PrivacyDeleteResponse | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog({
    isOpen,
    onClose: () => setIsOpen(false),
    dialogRef,
  });

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setError(null);
      setExportResult(null);
      setDeleteResult(null);
    };

    window.addEventListener("vault_open_privacy_modal", handleOpen);
    return () => {
      window.removeEventListener("vault_open_privacy_modal", handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setExportResult(null);
    setDeleteResult(null);

    try {
      const res = await fetch("/api/privacy/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (action === "export") {
        setExportResult(data);
      } else {
        setDeleteResult(data);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Ocurrió un error al procesar su solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!exportResult) return;
    const blob = new Blob([JSON.stringify(exportResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault_datos_personales_${email}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        className="w-full max-w-lg rounded-none sm:rounded-sm bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <LockIcon className="w-5 h-5 text-accent" />
            <h2 id="privacy-modal-title" className="text-xl font-display font-black tracking-wider text-white uppercase">
              DERECHOS DE PRIVACIDAD (ARCO)
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar modal de privacidad"
            className="text-zinc-400 hover:text-accent text-xs font-mono font-bold tracking-widest px-2.5 py-1.5 border border-zinc-800 rounded-none cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <CloseIcon className="w-3.5 h-3.5" /> CERRAR
          </button>
        </div>

        <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6">
          Conforme al RGPD (Unión Europea) y a la Ley 21.719 (Chile), usted tiene derecho al acceso, portabilidad y supresión de sus datos personales vinculados a sus compras en Vault Hypercars.
        </p>

        {error && (
          <div role="alert" className="p-3 mb-4 rounded-none bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {exportResult && (
          <div className="p-4 mb-6 rounded-none bg-accent/10 border border-accent/30 space-y-3">
            <span className="text-xs font-mono font-bold text-accent block uppercase">
              EXPORTACIÓN COMPLETADA
            </span>
            <p className="text-xs font-mono text-zinc-300">
              {exportResult.message}
            </p>
            {exportResult.orders.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="w-full py-2.5 rounded-none bg-accent text-accent-contrast font-display font-black text-xs tracking-wider cursor-pointer uppercase transition-colors hover:bg-accent-hover"
              >
                DESCARGAR ARCHIVO JSON
              </button>
            )}
          </div>
        )}

        {deleteResult && (
          <div className="p-4 mb-6 rounded-none bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 block uppercase">
              DERECHO AL OLVIDO EJERCIDO
            </span>
            <p className="text-xs font-mono text-zinc-300">
              {deleteResult.message} Registros anonimizados: {deleteResult.recordsAffected}.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="privacy-email-input" className="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              CORREO ELECTRÓNICO REGISTRADO
            </label>
            <input
              id="privacy-email-input"
              type="email"
              required
              placeholder="cliente@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-none bg-zinc-900 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="privacy-action-select" className="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              DERECHO A EJERCER
            </label>
            <select
              id="privacy-action-select"
              value={action}
              onChange={(e) => setAction(e.target.value as PrivacyAction)}
              className="w-full px-4 py-2.5 rounded-none bg-zinc-900 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
            >
              <option value="export">Descargar mis datos (Portabilidad)</option>
              <option value="delete">Eliminar/Anonimizar mis datos (Derecho al olvido)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-accent text-accent-contrast font-display font-black text-xs tracking-wider rounded-none hover:bg-accent-hover active:scale-[0.98] transition-all shadow-[0_0_15px_var(--color-accent-glow)] cursor-pointer uppercase flex items-center justify-center gap-2"
          >
            {isLoading ? "PROCESANDO SOLICITUD..." : "ENVIAR SOLICITUD"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivacyModal;
