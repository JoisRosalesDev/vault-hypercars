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

export interface CheckoutItemPayload {
  id: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItemPayload[];
  idempotencyKey: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}
