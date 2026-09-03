# Plan de Tareas: Rediseño Exclusivo de UI/UX - VAULT Hypercars

## Fase 0: Cimientos Visuales & Motor Dinámico
- [x] T0.1 Inyectar variables CSS de Telemetría (Carbono, Titanio, Cyan, Corsa) en `app/globals.css`.
- [x] T0.2 Configurar extensiones de tema, sombras y fuentes en `tailwind.config.ts`.
- [x] T0.3 Implementar `ThemeContext.tsx` con hook `useTheme()` y sincronización con `localStorage`.
- [x] T0.4 Construir el átomo `ThemeToggle.tsx` con estética técnica brutalista.
- [x] T0.5 Integrar `Space_Grotesk` y `JetBrains_Mono`, script anti-flicker y `ThemeProvider` en `app/layout.tsx`.

## Fase 1: Átomos y Componentes de Navegación
- [x] T1.1 Integrar conmutador de tema y purgar dorado en `app/components/layout/Navbar.tsx`.
- [x] T1.2 Refactorizar `app/components/layout/Hero.tsx` con tipografía brutalista, métricas en `font-mono` y botón CTA `bg-accent`.
- [x] T1.3 Refactorizar `app/components/layout/SiteFooter.tsx` con botón de acceso admin en micro-borde técnico.

## Fase 2: Catálogo y E-Commerce
- [x] T2.1 Refactorizar `app/components/catalog/ProductCard.tsx` con *glassmorphism* brutalista, métricas en `font-mono tabular-nums` y preservación de contratos de prueba.
- [x] T2.2 Refactorizar `app/components/catalog/CatalogFilter.tsx` con pestañas geométricas de marca.
- [x] T2.3 Refactorizar `app/components/catalog/Catalogo.tsx` adaptando cabeceras y badges técnicos.
- [x] T2.4 Refactorizar `app/components/catalog/CatalogModal.tsx` con especificaciones de telemetría y botón `bg-accent`.
- [x] T2.5 Refactorizar `app/components/cart/CartDrawer.tsx` y `app/components/cart/CartItemRow.tsx` con chasis `bg-zinc-950` y acento dinámico.
- [x] T2.6 Refactorizar `app/components/ui/ToastNotification.tsx` con estética HUD.
- [x] T2.7 Refactorizar `app/components/Showroom.tsx` purgado de dorados y adaptado a telemetría.
- [x] T2.8 Refactorizar `app/page.tsx` con fondo base `bg-zinc-950`.

## Fase 3: Consola Administrativa
- [x] T3.1 Refactorizar `app/admin/login/page.tsx` con chasis brutalista sobre fondo carbono y preservación estricta de OAuth.
- [x] T3.2 Refactorizar `app/admin/dashboard/page.tsx` con panel de control de telemetría.
- [x] T3.3 Refactorizar `app/components/admin/CatalogTable.tsx` con estética de consola de pista y cifras `tabular-nums`.
- [x] T3.4 Refactorizar `app/components/admin/DashboardAnalytics.tsx` con tarjetas métricas HUD.
- [x] T3.5 Refactorizar `app/components/admin/AdminModals.tsx` con modales técnicos de edición y confirmación.

## Fase 4: Auditoría y Verificación
- [x] T4.1 Ejecutar `npx tsc --noEmit` y confirmar 0 errores de tipos.
- [x] T4.2 Ejecutar `npm run test:unit` y verificar 10/10 pruebas unitarias aprobadas.
- [x] T4.3 Verificar inmutabilidad absoluta de `prisma/schema.prisma` y rutas de `app/api/`.
