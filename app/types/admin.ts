import { Brand, ItemStatus, CatalogItem } from "./catalog";
import { Currency } from "./cart";

export type AdminModalAction = "create" | "update" | "delete";

export interface CatalogFormData {
  id?: string;
  brand: Brand;
  name: string;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  currency?: Currency;
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
