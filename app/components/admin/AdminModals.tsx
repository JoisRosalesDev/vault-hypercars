"use client";

import React from "react";
import { CatalogFormData, ConfirmModalState } from "../../types/admin";
import { CatalogItem } from "../../types/catalog";
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
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0e0e14] border border-white/20 p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-[#f5d061] tracking-widest uppercase block">EDICIÓN EN TIEMPO REAL</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  EDITAR: {editingItem?.name}
                </h3>
              </div>

              <button
                onClick={onCloseEdit}
                className="text-zinc-400 hover:text-white text-xs font-bold tracking-widest px-3 py-1.5 border border-white/10 rounded cursor-pointer flex items-center gap-1"
              >
                <CloseIcon className="w-4 h-4" /> CERRAR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">MARCA</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Bugatti">Bugatti</option>
                  <option value="Lamborghini">Lamborghini</option>
                  <option value="Ferrari">Ferrari</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">MODELO DE HIPERAUTO</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">AÑO DE FABRICACIÓN</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">POTENCIA (HP)</label>
                <input
                  type="text"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">VELOCIDAD MÁXIMA</label>
                <input
                  type="text"
                  value={formData.topSpeed}
                  onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">PRECIO DE VENTA (USD)</label>
                <input
                  type="number"
                  value={formData.priceUSD}
                  onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-2">IMAGEN DEL VEHÍCULO (URL O SELECCIONAR LOCAL)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                  <label className="px-4 py-3 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5">
                    <FolderIcon className="w-4 h-4" /> SUBIR
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">ESTADO DE DISPONIBILIDAD</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Unidad Final">Unidad Final</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-2">DESCRIPCIÓN DETALLADA</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
              <button
                onClick={onCloseEdit}
                className="px-6 py-3 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={() => onRequestConfirm("update")}
                className="px-8 py-3 bg-[#d4af37] text-black font-extrabold text-xs tracking-widest rounded hover:bg-[#f5d061] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
              >
                GUARDAR CAMBIOS CON CONFIRMACIÓN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Item Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0e0e14] border border-white/20 p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-[#f5d061] tracking-widest uppercase block">NUEVA PUBLICACIÓN</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  REGISTRAR NUEVO HIPERAUTO
                </h3>
              </div>

              <button
                onClick={onCloseCreate}
                className="text-zinc-400 hover:text-white text-xs font-bold tracking-widest px-3 py-1.5 border border-white/10 rounded cursor-pointer flex items-center gap-1"
              >
                <CloseIcon className="w-4 h-4" /> CERRAR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">MARCA</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Bugatti">Bugatti</option>
                  <option value="Lamborghini">Lamborghini</option>
                  <option value="Ferrari">Ferrari</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">MODELO DE HIPERAUTO</label>
                <input
                  type="text"
                  placeholder="Ej. Bugatti Bolide"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">AÑO DE FABRICACIÓN</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">POTENCIA (HP)</label>
                <input
                  type="text"
                  placeholder="1,950 HP"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">VELOCIDAD MÁXIMA</label>
                <input
                  type="text"
                  placeholder="420 km/h"
                  value={formData.topSpeed}
                  onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">PRECIO DE VENTA (USD)</label>
                <input
                  type="number"
                  placeholder="3500000"
                  value={formData.priceUSD}
                  onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-2">IMAGEN DEL VEHÍCULO (URL O SELECCIONAR LOCAL)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                  <label className="px-4 py-3 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5">
                    <FolderIcon className="w-4 h-4" /> SUBIR
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">ESTADO DE DISPONIBILIDAD</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Unidad Final">Unidad Final</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-2">DESCRIPCIÓN DETALLADA</label>
                <textarea
                  rows={3}
                  placeholder="Escribe la descripción exclusiva..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
              <button
                onClick={onCloseCreate}
                className="px-6 py-3 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={() => onRequestConfirm("create")}
                className="px-8 py-3 bg-[#d4af37] text-black font-extrabold text-xs tracking-widest rounded hover:bg-[#f5d061] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
              >
                CREAR Y PUBLICAR CON CONFIRMACIÓN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 rounded-2xl bg-[#0e0e14] border border-white/20 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f5d061] flex items-center justify-center mx-auto mb-4">
              <AlertTriangleIcon className="w-6 h-6 text-[#f5d061]" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">DOBLE CONFIRMACIÓN REQUERIDA</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              {confirmModal.action === "create" && "¿Estás seguro de que deseas crear y publicar este nuevo vehículo en el catálogo live?"}
              {confirmModal.action === "update" && `¿Estás seguro de que deseas guardar las modificaciones realizadas a ${editingItem?.name}?`}
              {confirmModal.action === "delete" && `¿Estás seguro de que deseas eliminar permanentemente el vehículo ${confirmModal.targetItem?.name}?`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancelConfirm}
                className="flex-1 py-3 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={onExecuteConfirm}
                className="flex-1 py-3 rounded bg-[#d4af37] text-black text-xs font-extrabold tracking-wider hover:bg-[#f5d061] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
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
