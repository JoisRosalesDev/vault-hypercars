# OpenSpec Tasks: Refactoring & Reorganizing Vault Hypercars Architecture

**Change ID**: `refactor-vault-architecture`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  
**Status**: Completed  

---

## Task Overview

This document outlines the step-by-step implementation tasks to refactor the Vault Hypercars application into a modular, domain-layered architecture. Execution is divided into six sequential phases to ensure incremental verification, zero regressions, and full TypeScript compliance.

---

## Phase 1: Domain & Data Layer Foundation

- [x] **Task 1.1: Extract Catalog Domain Types**
  - Create `app/types/catalog.ts`.
  - Define `Brand`, `ItemStatus`, `HypercarSpecs`, and `CatalogItem` interfaces/types.
  - *Verification*: Run `npx tsc --noEmit` to confirm `app/types/catalog.ts` compiles without errors.

- [x] **Task 1.2: Extract Cart & Currency Domain Types**
  - Create `app/types/cart.ts`.
  - Define `Currency`, `CurrencyDetails`, `CurrencyRatesMap`, `CartItem`, and `AddToCartInput` interfaces/types.
  - Import `Brand` from `./catalog`.
  - *Verification*: Run `npx tsc --noEmit`.

- [x] **Task 1.3: Extract Admin Domain Types**
  - Create `app/types/admin.ts`.
  - Define `AdminModalAction`, `CatalogFormData`, `ConfirmModalState`, and `DashboardMetrics` interfaces/types.
  - Import `Brand`, `ItemStatus`, and `CatalogItem` from `./catalog`.
  - *Verification*: Run `npx tsc --noEmit`.

- [x] **Task 1.4: Create Decoupled Static Dataset**
  - Create `app/data/initialCatalog.ts`.
  - Populate with typed hypercar records (`initialCatalogItems: CatalogItem[]`) for Bugatti, Lamborghini, and Ferrari.
  - *Verification*: Verify dataset adheres to `CatalogItem` schema via `npx tsc --noEmit`.

- [x] **Task 1.5: Extract Multi-Currency Utility Helper**
  - Create `app/lib/currency.ts`.
  - Export `CURRENCY_RATES` (`USD`, `EUR`, `GBP`, `AED`) and `formatPrice(priceUSD: number, currency?: Currency): string`.
  - *Verification*: Import helper and test price conversion calculations via TypeScript checks.

---

## Phase 2: Custom Hook & Context State Management

- [x] **Task 2.1: Refactor Shopping Cart Context**
  - Update `app/context/CartContext.tsx` to consume domain types from `app/types/cart.ts` and `app/lib/currency.ts`.
  - Export `CartContext` and `CartProvider`.
  - *Verification*: Ensure `CartProvider` compiles cleanly with strict typing.

- [x] **Task 2.2: Implement Custom Cart Hook**
  - Create `app/hooks/useHypercarCart.ts`.
  - Expose `cart`, `cartCount`, `totalUSD`, `formattedTotal`, `currency`, `setCurrency`, `addToCart`, `removeFromCart`, `clearCart`, `isCartOpen`, `setIsCartOpen`, `formatPrice`, and `toastMessage`.
  - Export alias `useCart`.
  - *Verification*: Confirm `useHypercarCart` throws proper context error when used outside `CartProvider` and compiles with `npx tsc --noEmit`.

---

## Phase 3: Shared UI & Atomic Layout Component Extraction

- [x] **Task 3.1: Reorganize Shared UI Components**
  - Relocate vector SVG icon dictionary into `app/components/ui/Icons.tsx`.
  - Relocate toast notification banner into `app/components/ui/ToastNotification.tsx`.
  - *Verification*: Run `npx tsc --noEmit` to ensure zero missing SVG icon exports.

- [x] **Task 3.2: Extract Navbar Layout Component**
  - Create `app/components/layout/Navbar.tsx`.
  - Implement glassmorphism header, brand logo, navigation links, currency selector, cart badge trigger, and mobile drawer hamburger toggle.
  - *Verification*: Verify component exports `NavbarProps` and renders cleanly.

- [x] **Task 3.3: Extract Hero Layout Component**
  - Create `app/components/layout/Hero.tsx`.
  - Implement full-bleed background video loop (`/Futuristic Sports Car Racing Through Illuminated Tunnel.mp4`), radial gradient overlay, headline, performance specs grid, and CTA buttons.
  - *Verification*: Ensure video path and responsive layout compile cleanly.

- [x] **Task 3.4: Extract Site Footer Layout Component**
  - Create `app/components/layout/SiteFooter.tsx`.
  - Implement obsidian footer with copyright information, navigation links, and discrete `ACCESO ADMIN` link targeting `/admin/login`.
  - *Verification*: Verify footer link targets `/admin/login`.

---

## Phase 4: Customer Catalog & Cart Modular Component Decomposition

- [x] **Task 4.1: Extract Brand Filter Component**
  - Create `app/components/catalog/CatalogFilter.tsx`.
  - Implement brand tab triggers (`TODAS LAS MARCAS`, `BUGATTI`, `LAMBORGHINI`, `FERRARI`) with champagne gold active highlight.
  - *Verification*: Verify brand selection callback triggers properly.

- [x] **Task 4.2: Extract Atomic Hypercar Product Card**
  - Create `app/components/catalog/ProductCard.tsx`.
  - Implement card layout displaying vehicle thumbnail image, brand badge, model name, year, HP, top speed, formatted price, details view button, and add-to-cart button.
  - *Verification*: Confirm `ProductCardProps` typing and price formatting output.

- [x] **Task 4.3: Extract Responsive Catalog Grid**
  - Create `app/components/catalog/CatalogGrid.tsx`.
  - Implement responsive CSS Grid rendering filtered `ProductCard` items.
  - *Verification*: Verify grid layout responsiveness across breakpoints.

- [x] **Task 4.4: Extract Catalog Modal Inspector**
  - Create `app/components/catalog/CatalogModal.tsx`.
  - Implement detail modal displaying full vehicle image, full specifications table (HP, top speed, acceleration, engine), detailed description, and add-to-cart action.
  - *Verification*: Verify modal open/close toggle and action callbacks.

- [x] **Task 4.5: Extract Cart Item Row Component**
  - Create `app/components/cart/CartItemRow.tsx`.
  - Implement row view with thumbnail, name, brand, formatted unit price, quantity controls (`+`, `-`), and remove button.
  - *Verification*: Verify quantity mutation events compile cleanly.

- [x] **Task 4.6: Refactor Cart Drawer Component**
  - Relocate/Refactor `app/components/cart/CartDrawer.tsx`.
  - Connect to `useHypercarCart` custom hook, render list of `CartItemRow` items, currency switcher, subtotal calculation, and VIP checkout button.
  - *Verification*: Confirm slide-over drawer animation and state toggling.

- [x] **Task 4.7: Simplify Customer Landing Page**
  - Refactor `app/page.tsx` to compose `Navbar`, `Hero`, `CatalogFilter`, `CatalogGrid`, `CatalogModal`, `CartDrawer`, `ToastNotification`, and `SiteFooter`.
  - Clean up legacy monolithic files (`app/components/Catalogo.tsx`, `Showroom.tsx`).
  - *Verification*: Run `npx tsc --noEmit` and check landing page layout.

---

## Phase 5: Admin Dashboard Deconstruct & Modals Decomposition

- [x] **Task 5.1: Extract Admin Dashboard Analytics Component**
  - Create `app/components/admin/DashboardAnalytics.tsx`.
  - Implement metric cards displaying Total Inventory Value ($M USD), Active Units, Monthly Revenue, and Conversion Rate.
  - *Verification*: Verify metric card calculations with `DashboardMetrics` props.

- [x] **Task 5.2: Extract Catalog Management Table Component**
  - Create `app/components/admin/CatalogTable.tsx`.
  - Implement inventory management table displaying vehicle preview, brand, year, power, price, status badge, edit button, delete button, and "NUEVO HIPERCOCHE" trigger.
  - *Verification*: Confirm table callbacks (`onOpenCreate`, `onOpenEdit`, `onRequestDelete`).

- [x] **Task 5.3: Extract Admin Dialog Modals Component**
  - Create `app/components/admin/AdminModals.tsx`.
  - Encapsulate `ProductFormModal` (inputs for name, brand, year, price, hp, top speed, acceleration, engine, status, image URL/file upload) and `ConfirmModal` (double-confirmation modal).
  - *Verification*: Verify form validation and confirmation action callbacks.

- [x] **Task 5.4: Simplify Admin Dashboard Page Container**
  - Refactor `app/admin/dashboard/page.tsx` into a lightweight container managing catalog state and composing `DashboardAnalytics`, `CatalogTable`, and `AdminModals`.
  - *Verification*: Confirm admin route state handling and modal workflows.

---

## Phase 6: Verification & Quality Assurance

- [x] **Task 6.1: Strict Type Safety Verification**
  - Run `npx tsc --noEmit` across the entire workspace.
  - Fix any lingering type mismatches or missing imports.
  - *Verification*: Command exits with code 0 and zero errors.

- [x] **Task 6.2: Linting Compliance Verification**
  - Run `pnpm lint` (or `npm run lint`).
  - Resolve any ESLint warnings or code style issues.
  - *Verification*: Clean linter run with zero errors.

- [x] **Task 6.3: End-to-End Functional Verification**
  - Verify landing page layout, video background loop, brand filtering, cart slide-over, multi-currency conversion, and admin portal double-confirmation modals.
  - *Verification*: Confirm zero visual or functional regressions.

