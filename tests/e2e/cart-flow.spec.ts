import { test, expect } from '@playwright/test';

test.describe('Cart Lifecycle Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes full cart lifecycle: add item, view drawer, switch currency, remove item, and close drawer', async ({ page }) => {
    // 1. Locate first available product card and get vehicle name
    const firstCard = page
      .locator('.group')
      .filter({ has: page.locator('button:has-text("AÑADIR AL CARRITO")') })
      .first();
    await firstCard.waitFor({ state: 'visible' });
    const carName = (await firstCard.locator('h3').innerText()).trim();

    // 2. Add vehicle to cart from catalog, verify toast notification appears
    const addToCartBtn = firstCard.locator('button:has-text("AÑADIR AL CARRITO")');
    await addToCartBtn.click();

    const toastNotification = page.locator('text=/añadido al carrito/i');
    await expect(toastNotification).toBeVisible();
    await expect(page.locator(`text=¡${carName} añadido al carrito!`)).toBeVisible();

    // 3. Verify cart drawer opens with item details (name, quantity, formatted price)
    const drawer = page.locator('div.fixed.inset-0');
    await expect(drawer).toBeVisible();
    await expect(page.locator('text=CARRITO DE COMPRAS')).toBeVisible();

    // Item details verification
    await expect(drawer.locator('h4', { hasText: carName })).toBeVisible();
    await expect(drawer.locator('text=/x 1/')).toBeVisible();
    await expect(drawer.locator('text=TOTAL A PAGAR:')).toBeVisible();

    // 4. Test currency switcher inside drawer: switch to EUR, verify currency updates (e.g. '€')
    const eurButton = drawer.locator('button:has-text("EUR")');
    await expect(eurButton).toBeVisible();
    await eurButton.click();

    // Verify formatted price updates to EUR symbol '€'
    await expect(drawer.locator('text=/€[0-9]/').first()).toBeVisible();

    // 5. Remove item from cart by clicking remove button
    const removeBtn = drawer.locator('button:has-text("ELIMINAR")').first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // 6. Verify empty cart state appears ("Tu carrito de hiperautos está vacío") and total price footer disappears
    await expect(drawer.locator('text=Tu carrito de hiperautos está vacío')).toBeVisible();
    await expect(drawer.locator('text=TOTAL A PAGAR:')).not.toBeVisible();
    await expect(drawer.locator('button:has-text("FINALIZAR COMPRA VIP")')).not.toBeVisible();

    // 7. Test closing cart drawer and verify drawer is hidden
    const closeBtn = drawer.locator('button:has-text("CERRAR")');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(page.locator('text=CARRITO DE COMPRAS')).not.toBeVisible();
  });
});
