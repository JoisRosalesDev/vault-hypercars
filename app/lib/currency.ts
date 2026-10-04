import { Currency, CurrencyRatesMap } from "../types/cart";

export const CURRENCY_RATES: CurrencyRatesMap = {
  USD: { symbol: "$", rate: 1.0 },
  EUR: { symbol: "€", rate: 0.92 },
  CLP: { symbol: "CLP $", rate: 950 }
};

export function formatPrice(priceUSD: number, currency: Currency = "USD"): string {
  const { symbol, rate } = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(priceUSD * rate);
  return `${symbol}${converted.toLocaleString()}`;
}
