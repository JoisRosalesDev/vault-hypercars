import { test, expect } from '@playwright/test';

test.describe('Admin Authentication and Access Flow', () => {
  test('redirects unauthorized access from /admin/dashboard to /admin/login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForURL(/\/admin\/login/);
    expect(page.url()).toContain('/admin/login');
  });

  test('displays login page elements with intact branding and Google login button', async ({ page }) => {
    await page.goto('/admin/login');

    // 1. Verify 'INICIAR SESIÓN CON GOOGLE' button is visible
    const googleLoginBtn = page.locator('button:has-text("INICIAR SESIÓN CON GOOGLE")');
    await expect(googleLoginBtn).toBeVisible();

    // 2. Verify branding is intact
    await expect(page.locator('text=VAULT').first()).toBeVisible();
    await expect(page.locator('text=HYPERCARS').first()).toBeVisible();
    await expect(page.locator('text=Acceso Administrativo')).toBeVisible();
    await expect(page.locator('text=PANEL DE CONTROL // AUTENTICACIÓN RESTRINGIDA')).toBeVisible();
  });

  test('displays access denied state with secure message', async ({ page }) => {
    await page.goto('/admin/login?error=AccessDenied');

    // 1. Verify 'ACCESO DENEGADO' banner is visible
    const deniedBanner = page.locator('text=ACCESO DENEGADO');
    await expect(deniedBanner).toBeVisible();

    // 2. Verify it displays secure authorization message without leaking email
    await expect(page.locator('text=/no tiene privilegios de administrador/i')).toBeVisible();
  });

  test('navigates back to home page when clicking ← VOLVER AL INICIO', async ({ page }) => {
    await page.goto('/admin/login');

    const backLink = page.locator('text=← VOLVER AL INICIO');
    await expect(backLink).toBeVisible();
    await backLink.click();

    await page.waitForURL('/');
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
