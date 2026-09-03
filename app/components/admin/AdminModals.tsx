"use client";

import React from "react";
import { CatalogFormData, ConfirmModalState } from "../../types/admin";
import { CatalogItem, Brand, ItemStatus } from "../../types/catalog";
import { AlertTriangleIcon, FolderIcon, CloseIcon } from "../ui/Icons";

export interface AdminModalsProps {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  editingItem: CatalogItem | null;
  formData: CatalogFormData;
  setFormData: React.Dispatch<React.SetStateAction<CatalogFormData>>;
  confirmModal: ConfirmModalState;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onRequestConfirm: (action: "create" | "update" | "delete") => void;
  onExecuteConfirm: () => void;
  onCancelConfirm: () => void;
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AdminModals({
  isCreateOpen,
  isEditOpen,
  editingItem,
  formData,
  setFormData,
  confirmModal,
  onCloseCreate,
  onCloseEdit,
  onRequestConfirm,
  onExecuteConfirm,
  onCancelConfirm,
  handleImageFileChange
}: AdminModalsProps) {
  return (
    <>
      {/* Edit Item Modal */}
      {/* Edit Item Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none sm:rounded-sm bg-zinc-950 border border-zinc-800 p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-accent tracking-widest uppercase block">EDICIÓN EN TIEMPO REAL</span>
                <h3 className="text-2xl font-display font-black text-white mt-1 uppercase">
                  EDITAR: {editingItem?.name}
                </h3>
              </div>

              <button
                onClick={onCloseEdit}
                className="text-zinc-400 hover:text-accent hover:border-accent text-xs font-mono font-bold tracking-widest px-3 py-1.5 border border-zinc-800 rounded-none cursor-pointer flex items-center gap-1 transition-colors"
              >
                <CloseIcon className="w-4 h-4" /> CERRAR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">MARCA</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as Brand })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="Bugatti">Bugatti</option>
                  <option value="Lamborghini">Lamborghini</option>
                  <option value="Ferrari">Ferrari</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">MODELO DE HIPERAUTO</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">AÑO DE FABRICACIÓN</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">POTENCIA (HP)</label>
                <input
                  type="text"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">VELOCIDAD MÁXIMA</label>
                <input
                  type="text"
                  value={formData.topSpeed}
                  onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">PRECIO DE VENTA (USD)</label>
                <input
                  type="number"
                  value={formData.priceUSD}
                  onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">IMAGEN DEL VEHÍCULO (URL O SELECCIONAR LOCAL)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                  />
                  <label className="px-4 py-2.5 rounded-none bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-accent text-zinc-300 hover:text-accent text-xs font-mono font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                    <FolderIcon className="w-4 h-4" /> SUBIR
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">ESTADO DE DISPONIBILIDAD</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Unidad Final">Unidad Final</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">UNIDADES EN INVENTARIO (STOCK)</label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock ?? 1}
                  onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">DESCRIPCIÓN DETALLADA</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                onClick={onCloseEdit}
                className="px-6 py-3 rounded-none bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer transition-colors uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={() => onRequestConfirm("update")}
                className="px-6 py-3 bg-accent text-accent-contrast font-display font-black text-xs tracking-widest rounded-none hover:bg-accent-hover transition-all duration-150 shadow-[0_0_15px_var(--color-accent-glow)] cursor-pointer uppercase"
              >
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Item Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none sm:rounded-sm bg-zinc-950 border border-zinc-800 p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-accent tracking-widest uppercase block">NUEVA PUBLICACIÓN</span>
                <h3 className="text-2xl font-display font-black text-white mt-1 uppercase">
                  REGISTRAR NUEVO HIPERAUTO
                </h3>
              </div>

              <button
                onClick={onCloseCreate}
                className="text-zinc-400 hover:text-accent hover:border-accent text-xs font-mono font-bold tracking-widest px-3 py-1.5 border border-zinc-800 rounded-none cursor-pointer flex items-center gap-1 transition-colors"
              >
                <CloseIcon className="w-4 h-4" /> CERRAR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">MARCA</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as Brand })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="Bugatti">Bugatti</option>
                  <option value="Lamborghini">Lamborghini</option>
                  <option value="Ferrari">Ferrari</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">MODELO DE HIPERAUTO</label>
                <input
                  type="text"
                  placeholder="Ej. Bugatti Bolide"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">AÑO DE FABRICACIÓN</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">POTENCIA (HP)</label>
                <input
                  type="text"
                  placeholder="1,950 HP"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">VELOCIDAD MÁXIMA</label>
                <input
                  type="text"
                  placeholder="420 km/h"
                  value={formData.topSpeed}
                  onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">PRECIO DE VENTA (USD)</label>
                <input
                  type="number"
                  placeholder="3500000"
                  value={formData.priceUSD}
                  onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">IMAGEN DEL VEHÍCULO (URL O SELECCIONAR LOCAL)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                  />
                  <label className="px-4 py-2.5 rounded-none bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-accent text-zinc-300 hover:text-accent text-xs font-mono font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                    <FolderIcon className="w-4 h-4" /> SUBIR
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">ESTADO DE DISPONIBILIDAD</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Unidad Final">Unidad Final</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">UNIDADES EN INVENTARIO (STOCK)</label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock ?? 1}
                  onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">DESCRIPCIÓN DETALLADA</label>
                <textarea
                  rows={3}
                  placeholder="Escribe la descripción exclusiva..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-zinc-900/80 border border-zinc-800 text-sm text-white font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                onClick={onCloseCreate}
                className="px-6 py-3 rounded-none bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer transition-colors uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={() => onRequestConfirm("create")}
                className="px-6 py-3 bg-accent text-accent-contrast font-display font-black text-xs tracking-widest rounded-none hover:bg-accent-hover transition-all duration-150 shadow-[0_0_15px_var(--color-accent-glow)] cursor-pointer uppercase"
              >
                CREAR Y PUBLICAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 rounded-none sm:rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl text-center">
            <div className={`w-12 h-12 rounded-none flex items-center justify-center mx-auto mb-4 ${
              confirmModal.action === "delete"
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                : "bg-accent/10 border border-accent/30 text-accent"
            }`}>
              <AlertTriangleIcon className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-display font-black text-white mb-2 uppercase">DOBLE CONFIRMACIÓN REQUERIDA</h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6">
              {confirmModal.action === "create" && "¿Estás seguro de que deseas crear y publicar este nuevo vehículo en el catálogo live?"}
              {confirmModal.action === "update" && `¿Estás seguro de que deseas guardar las modificaciones realizadas a ${editingItem?.name}?`}
              {confirmModal.action === "delete" && `¿Estás seguro de que deseas eliminar permanentemente el vehículo ${confirmModal.targetItem?.name}?`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancelConfirm}
                className="flex-1 py-3 rounded-none bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer transition-colors uppercase"
              >
                CANCELAR
              </button>
              <button
                onClick={onExecuteConfirm}
                className={`flex-1 py-3 rounded-none font-display font-black text-xs tracking-wider transition-all cursor-pointer uppercase ${
                  confirmModal.action === "delete"
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    : "bg-accent text-accent-contrast hover:bg-accent-hover shadow-[0_0_15px_var(--color-accent-glow)]"
                }`}
              >
                CONFIRMAR OPERACIÓN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminModals;
