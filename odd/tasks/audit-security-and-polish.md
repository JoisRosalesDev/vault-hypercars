# Feature: Remediación de Auditoría, Seguridad y Pulido UI (/impeccable)

## Objective
Resolver las vulnerabilidades críticas de seguridad (P0) y persistencia de datos identificadas en la auditoría, corregir los defectos de accesibilidad y foco (P1), integrar el componente interactivo Showroom y pulir la consistencia visual y ergonomía táctil (P2/P3).

## Scope & Constraints
- TDD Mode: Existing test runner (Vitest + Playwright E2E).
- Conventional commits per task on feature branch `fix/audit-security-and-polish`.
- Mirror: Pending (Engram not configured).

## Implementation Tasks

- [ ] `TASK-1`: Remediación de Seguridad P0 y Persistencia de Imágenes
  - Sanitizar mensaje en `app/admin/login/page.tsx` para eliminar la fuga de email de administrador (`joisrosafer@gmail.com`).
  - Actualizar `tests/e2e/auth-flow.spec.ts` para que coincida con el mensaje sanitizado.
  - Implementar endpoint `/api/admin/upload/route.ts` para procesar y persistir imágenes subidas, y actualizar `app/admin/dashboard/page.tsx` para evitar `blob:` efímeros en la base de datos.
  - Corregir el botón de "Cerrar Sesión" en `app/admin/dashboard/page.tsx` para que invoque `signOut()`.

- [ ] `TASK-2`: Accesibilidad en Modales y Controles Interactivos (P1)
  - Resolver la condición de carrera de focus trap en modales anidados en `app/components/admin/AdminModals.tsx`.
  - Hacer accesible por teclado el input de subida de imágenes en `AdminModals.tsx`.
  - Añadir `aria-pressed` y semántica de estado a `CatalogFilter.tsx` y `ThemeToggle.tsx`.
  - Añadir `role="status"` y `aria-live="polite"` a `ToastNotification.tsx`.

- [ ] `TASK-3`: Integración de Showroom y Limpieza Estructural (P2/P3)
  - Integrar el componente interactivo `Showroom.tsx` en `app/page.tsx` con su telemetría y audio V12.
  - Eliminar los archivos barril redundantes (`app/components/CartDrawer.tsx`, `Catalogo.tsx`, `Icons.tsx`) y unificar imports.

- [ ] `TASK-4`: Pulido Visual, Ergonomía Táctil y Tokens de Diseño (P1/P2)
  - Corregir en `CatalogGrid.tsx` los estilos ajenos: cambiar `rounded-2xl`, `rounded-xl` y `#0e0e14` por tokens del sistema (`rounded-none`, `bg-zinc-950`).
  - Optimizar `ProductCard.tsx` (`loading="lazy"` y etiqueta clara en botón de inspección).
  - Añadir atributo `poster` y soporte `prefers-reduced-motion` a `Hero.tsx`.
  - Aumentar los touch targets a un mínimo de 44x44px en selectores de divisa y botones de acción.

- [ ] `TASK-5`: Verificación Integral de Suites de Prueba y Cierre
  - Ejecutar Vitest y Playwright E2E para confirmar 0 regresiones.
  - Ejecutar `impeccable detect`.
