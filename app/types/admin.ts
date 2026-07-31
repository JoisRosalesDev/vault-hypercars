import { Brand, ItemStatus, CatalogItem } from "./catalog";

export type AdminModalAction = "create" | "update" | "delete";

export interface CatalogFormData {
  id?: string;
  brand: Brand;
  name: string;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  currency?: "USD" | "EUR" | "GBP" | "AED";
  status: ItemStatus;
  stock: number;
  description: string;
  image: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  action: AdminModalAction | null;
  targetItem: CatalogItem | null;
}

export interface DashboardMetrics {
  totalInventoryUSD: number;
  activeUnitsCount: number;
  monthlyRevenueUSD: number;
  conversionRate: number;
}
