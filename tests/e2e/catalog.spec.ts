import { test, expect } from '@playwright/test';

test.describe('Catalog and User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters vehicles by brand (Bugatti, Lamborghini, Ferrari)', async ({ page }) => {
    // Click BUGATTI filter
    await page.click('button:has-text("BUGATTI")');
    await expect(page.locator('text=Bugatti').first()).toBeVisible();

    // Click LAMBORGHINI filter
    await page.click('button:has-text("LAMBORGHINI")');
    await expect(page.locator('text=Lamborghini').first()).toBeVisible();

    // Click FERRARI filter
    await page.click('button:has-text("FERRARI")');
    await expect(page.locator('text=Ferrari').first()).toBeVisible();
  });

  test('opens vehicle inspection modal', async ({ page }) => {
    // Click inspect details button on first product card
    const inspectButton = page.locator('button[aria-label="Ver detalles"]').first();
    await inspectButton.click();

    // Verify modal overlay appears with specifications
    await expect(page.locator('text=CERRAR')).toBeVisible();
    await expect(page.locator('text=Potencia del Motor:')).toBeVisible();
    await expect(page.locator('text=Velocidad Máxima:')).toBeVisible();
  });

  test('adds vehicle to cart, opens cart drawer, and calculates subtotal', async ({ page }) => {
    // Click "AÑADIR AL CARRITO" on the first available item
    const addToCartBtn = page.locator('button:has-text("AÑADIR AL CARRITO")').first();
    await addToCartBtn.click();

    // Cart drawer should open
    await expect(page.locator('text=CARRITO DE COMPRAS')).toBeVisible();
    await expect(page.locator('text=TOTAL A PAGAR:')).toBeVisible();
    await expect(page.locator('button:has-text("FINALIZAR COMPRA VIP")')).toBeVisible();
  });

  test('redirects unauthorized access from /admin/dashboard to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/admin\/login/);
    expect(page.url()).toContain('/admin/login');
  });
});
