import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept external Stripe domain navigation so tests don't depend on external network
    await page.route('https://checkout.stripe.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mock Stripe Checkout Page</body></html>',
      });
    });
  });

  test('completes successful VIP checkout and redirects to Stripe', async ({ page }) => {
    let capturedPayload: { items?: Array<{ id: string; quantity: number }>; idempotencyKey?: string } | null = null;

    await page.route('/api/checkout', async (route) => {
      capturedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/test-mock' }),
      });
    });

    await page.goto('/');

    // 1. Add vehicle to cart and open cart drawer
    const addToCartBtn = page.locator('button:has-text("AÑADIR AL CARRITO")').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    const drawer = page.locator('div.fixed.inset-0');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('text=CARRITO DE COMPRAS')).toBeVisible();

    // 2. Click 'FINALIZAR COMPRA VIP'
    const checkoutBtn = drawer.locator('button:has-text("FINALIZAR COMPRA VIP")');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 3. Verify navigation attempt / redirection to Stripe checkout
    await page.waitForURL('https://checkout.stripe.com/test-mock');
    expect(page.url()).toBe('https://checkout.stripe.com/test-mock');

    // 4. Verify request payload matching { items: [...], idempotencyKey: ... }
    expect(capturedPayload).toBeTruthy();
    expect(Array.isArray(capturedPayload?.items)).toBe(true);
    expect(capturedPayload!.items!.length).toBeGreaterThan(0);
    expect(capturedPayload!.items![0]).toHaveProperty('id');
    expect(capturedPayload!.items![0]).toHaveProperty('quantity');
    expect(capturedPayload).toHaveProperty('idempotencyKey');
    expect(typeof capturedPayload!.idempotencyKey).toBe('string');
  });

  test('handles checkout gateway failure with error banner and re-enables button', async ({ page }) => {
    await page.route('/api/checkout', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Error simulado de pasarela VIP' }),
      });
    });

    await page.goto('/');

    // 1. Add vehicle to cart and open cart drawer
    const addToCartBtn = page.locator('button:has-text("AÑADIR AL CARRITO")').first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    const drawer = page.locator('div.fixed.inset-0');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('text=CARRITO DE COMPRAS')).toBeVisible();

    // 2. Click 'FINALIZAR COMPRA VIP'
    const checkoutBtn = drawer.locator('button:has-text("FINALIZAR COMPRA VIP")');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 3. Verify error message banner appears with text 'Error simulado de pasarela VIP' inside the drawer
    const errorBanner = drawer.locator('text=Error simulado de pasarela VIP');
    await expect(errorBanner).toBeVisible();

    // 4. Verify the button re-enables
    await expect(checkoutBtn).toBeEnabled();
  });
});
