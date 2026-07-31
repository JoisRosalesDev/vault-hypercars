export type Brand = "Bugatti" | "Lamborghini" | "Ferrari";

export type ItemStatus = "Disponible" | "Unidad Final";

export interface HypercarSpecs {
  power: string;
  topSpeed: string;
  acceleration?: string;
  engine?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  brand: Brand;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  status: ItemStatus;
  description: string;
  image: string;
  specs?: HypercarSpecs;
}
