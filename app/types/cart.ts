import { Brand } from "./catalog";

export type Currency = "USD" | "EUR" | "GBP" | "AED";

export interface CurrencyDetails {
  symbol: string;
  rate: number;
}

export type CurrencyRatesMap = Record<Currency, CurrencyDetails>;

export interface CartItem {
  id: string;
  name: string;
  brand: Brand;
  priceUSD: number;
  image: string;
  quantity: number;
}

export type AddToCartInput = Omit<CartItem, "quantity">;
