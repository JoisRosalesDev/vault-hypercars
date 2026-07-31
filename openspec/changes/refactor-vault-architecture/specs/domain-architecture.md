# Delta Specification: Domain-Layered Architecture Refactoring

**Change ID**: `refactor-vault-architecture`  
**Target Specification**: `openspec/specs/vault-hypercars/spec.md`  
**Mode**: `hybrid`

---

## 1. Summary of Changes

This delta spec documents the architectural transition of Vault Hypercars from inline, monolithic component structures into a clean domain-layered modular architecture (`types/`, `data/`, `lib/`, `hooks/`, `components/layout/`, `components/catalog/`, `components/cart/`, `components/admin/`).

---

## 2. MODIFIED / NEW Capabilities & Layer Specifications

### 2.1 ADDED: Domain Layer Separation
- `app/types/catalog.ts`: Defines `Brand`, `ItemStatus`, `HypercarSpecs`, `CatalogItem`.
- `app/types/cart.ts`: Defines `Currency`, `CurrencyRate`, `CartItem`.
- `app/types/admin.ts`: Defines `AdminModalAction`, `CatalogFormData`, `DashboardMetrics`.
- `app/data/initialCatalog.ts`: Decoupled static catalog dataset.
- `app/lib/currency.ts`: Multi-currency exchange rates and price formatting utilities (`formatPrice`).

### 2.2 ADDED: Custom Hook Abstraction
- `app/hooks/useHypercarCart.ts`: Reusable custom hook encapsulating `CartContext` operations, item quantity mutations, active currency state, drawer toggle, and toast notifications.

### 2.3 ADDED: Atomic & Modular Component Hierarchy
- `app/components/layout/`: Modular `Navbar.tsx`, `Hero.tsx`, `SiteFooter.tsx`.
- `app/components/catalog/`: Modular `ProductCard.tsx`, `CatalogGrid.tsx`, `CatalogFilter.tsx`, `CatalogModal.tsx`.
- `app/components/cart/`: Modular `CartDrawer.tsx`, `CartItemRow.tsx`.
- `app/components/admin/`: Modular `DashboardAnalytics.tsx`, `CatalogTable.tsx`, `AdminModals.tsx`.
- `app/components/ui/`: `Icons.tsx` vector SVG library, `ToastNotification.tsx`.

### 2.4 MODIFIED: Page Container Simplification
- `app/page.tsx`: Transformed into a clean layout composition page.
- `app/admin/dashboard/page.tsx`: Transformed from a ~600-line monolithic file into a lightweight container composing modular admin components.

---

## 3. Verification Criteria & Constraints

1. Zero Visual/Functional Regression: Brand filtering, video background hero loop, shopping cart drawers, multi-currency conversion, and admin confirmation modals operate seamlessly.
2. `npx tsc --noEmit` and `pnpm lint` pass with 0 errors/warnings.
