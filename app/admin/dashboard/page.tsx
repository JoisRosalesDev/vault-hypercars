"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatalogItem } from "../../types/catalog";
import { CatalogFormData, ConfirmModalState, DashboardMetrics } from "../../types/admin";
import { DashboardAnalytics } from "../../components/admin/DashboardAnalytics";
import { CatalogTable } from "../../components/admin/CatalogTable";
import { AdminModals } from "../../components/admin/AdminModals";
import { LockIcon, AlertTriangleIcon } from "../../components/ui/Icons";

function mapCarToCatalogItem(car: any): CatalogItem {
  return {
    id: car.id,
    name: car.name,
    brand: car.brand,
    year: String(car.year),
    power: car.hp ? `${car.hp.toLocaleString()} HP` : (car.power || "1,000 HP"),
    topSpeed: car.topSpeed,
    priceUSD: Number(car.price ?? car.priceUSD ?? 0),
    status: car.status,
    description: car.description || "",
    image: car.image || "",
    specs: {
      power: car.hp ? `${car.hp.toLocaleString()} HP` : (car.power || "1,000 HP"),
      topSpeed: car.topSpeed,
      acceleration: car.acceleration,
      engine: car.engine
    }
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    action: null,
    targetItem: null
  });

  const [formData, setFormData] = useState<CatalogFormData>({
    brand: "Bugatti",
    name: "",
    year: "2026",
    power: "1,500 HP",
    topSpeed: "400 km/h",
    priceUSD: 3500000,
    currency: "USD",
    status: "Disponible",
    description: "",
    image: ""
  });

  const fetchAdminCars = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/admin/cars");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login?error=AccessDenied");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map(mapCarToCatalogItem) : [];
      setItems(mapped);
    } catch (err: any) {
      console.error("[Admin Cars Fetch Error]:", err);
      setApiError(err.message || "Failed to load hypercars inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdminCars();
  }, [fetchAdminCars]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: url }));
    }
  };

  const requestActionConfirm = (action: "create" | "update" | "delete", targetItem?: CatalogItem) => {
    setConfirmModal({
      isOpen: true,
      action,
      targetItem: targetItem || null
    });
  };

  const executeConfirmedAction = async () => {
    const { action, targetItem } = confirmModal;
    setConfirmModal({ isOpen: false, action: null, targetItem: null });
    setApiError(null);

    const parsedHp = parseInt(formData.power.replace(/[^\d]/g, "")) || 1000;
    const parsedYear = parseInt(formData.year) || 2026;

    try {
      if (action === "create") {
        const payload = {
          name: formData.name || "Nuevo Hiperauto",
          brand: formData.brand,
          year: parsedYear,
          price: Number(formData.priceUSD),
          hp: parsedHp,
          topSpeed: formData.topSpeed,
          acceleration: "0-100 km/h en 2.5s",
          engine: "V12 Hybrid",
          status: formData.status,
          description: formData.description || "Descripción exclusiva del vehículo.",
          image: formData.image || ""
        };

        const res = await fetch("/api/admin/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.status === 401 || res.status === 403) {
          router.push("/admin/login?error=AccessDenied");
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create car record");
        }

        setIsCreateModalOpen(false);
        resetForm();
        await fetchAdminCars();
      } else if (action === "update" && editingItem) {
        const payload = {
          name: formData.name,
          brand: formData.brand,
          year: parsedYear,
          price: Number(formData.priceUSD),
          hp: parsedHp,
          topSpeed: formData.topSpeed,
          status: formData.status,
          description: formData.description,
          image: formData.image
        };

        const res = await fetch(`/api/admin/cars/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.status === 401 || res.status === 403) {
          router.push("/admin/login?error=AccessDenied");
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update car record");
        }

        setIsEditModalOpen(false);
        resetForm();
        await fetchAdminCars();
      } else if (action === "delete" && targetItem) {
        const res = await fetch(`/api/admin/cars/${targetItem.id}`, {
          method: "DELETE"
        });

        if (res.status === 401 || res.status === 403) {
          router.push("/admin/login?error=AccessDenied");
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to delete car record");
        }

        await fetchAdminCars();
      }
    } catch (err: any) {
      console.error("[Admin Action Error]:", err);
      setApiError(err.message || "Action failed.");
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      brand: "Bugatti",
      name: "",
      year: "2026",
      power: "1,500 HP",
      topSpeed: "400 km/h",
      priceUSD: 3500000,
      currency: "USD",
      status: "Disponible",
      description: "",
      image: ""
    });
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      brand: item.brand,
      name: item.name,
      year: item.year,
      power: item.power,
      topSpeed: item.topSpeed,
      priceUSD: item.priceUSD,
      currency: "USD",
      status: item.status,
      description: item.description,
      image: item.image
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const totalInventoryUSD = items.reduce((acc, i) => acc + i.priceUSD, 0);

  const metrics: DashboardMetrics = {
    totalInventoryUSD,
    activeUnitsCount: items.length,
    monthlyRevenueUSD: 12400000,
    conversionRate: 24.8
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white font-sans selection:bg-[#f5d061] selection:text-black pb-20">
      {/* Admin Top Header */}
      <header className="border-b border-white/10 bg-[#0c0c10] px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-black tracking-[0.25em] text-[#f5d061]">VAULT</span>
            <span className="text-[8px] tracking-[0.4em] text-zinc-400">HYPERCARS ADMIN</span>
          </Link>
          <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
            <LockIcon className="w-3.5 h-3.5" /> PANEL DE ADMINISTRACIÓN
          </span>
        </div>

        <Link href="/" className="text-xs text-zinc-400 hover:text-white font-semibold">
          CERRAR SESIÓN →
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        {apiError && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-200 text-xs">
            <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Analytics Section */}
        <DashboardAnalytics metrics={metrics} />

        {/* Catalog Table Section */}
        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-[#0e0e14] border border-white/10">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-zinc-400">Cargando inventario desde la base de datos Supabase...</p>
          </div>
        ) : (
          <CatalogTable
            items={items}
            onOpenCreate={openCreateModal}
            onOpenEdit={openEditModal}
            onRequestDelete={(item) => requestActionConfirm("delete", item)}
          />
        )}
      </main>

      {/* Admin Modals Component */}
      <AdminModals
        isCreateOpen={isCreateModalOpen}
        isEditOpen={isEditModalOpen}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        confirmModal={confirmModal}
        onCloseCreate={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        onCloseEdit={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        onRequestConfirm={requestActionConfirm}
        onExecuteConfirm={executeConfirmedAction}
        onCancelConfirm={() => setConfirmModal({ isOpen: false, action: null, targetItem: null })}
        handleImageFileChange={handleImageFileChange}
      />
    </div>
  );
}
