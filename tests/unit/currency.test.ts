import { describe, it, expect } from 'vitest';
import { formatPrice, CURRENCY_RATES } from '@/app/lib/currency';

describe('currency utility', () => {
  it('formats USD prices by default', () => {
    expect(formatPrice(100)).toBe(`$${(100).toLocaleString()}`);
    expect(formatPrice(3500000)).toBe(`$${(3500000).toLocaleString()}`);
  });

  it('converts and formats EUR prices correctly', () => {
    const formatted = formatPrice(100, 'EUR');
    expect(formatted).toBe(`€${(92).toLocaleString()}`);
    expect(formatPrice(1000000, 'EUR')).toBe(`€${(920000).toLocaleString()}`);
  });

  it('converts and formats AED prices correctly', () => {
    const formatted = formatPrice(1000, 'AED');
    expect(formatted).toBe(`AED ${(3670).toLocaleString()}`);
    expect(formatPrice(1000000, 'AED')).toBe(`AED ${(3670000).toLocaleString()}`);
  });

  it('converts and formats GBP prices correctly', () => {
    expect(formatPrice(100, 'GBP')).toBe(`£${(78).toLocaleString()}`);
  });

  it('exposes correct rate exchange definitions', () => {
    expect(CURRENCY_RATES.USD.rate).toBe(1.0);
    expect(CURRENCY_RATES.EUR.rate).toBe(0.92);
    expect(CURRENCY_RATES.GBP.rate).toBe(0.78);
    expect(CURRENCY_RATES.AED.rate).toBe(3.67);
  });
});
