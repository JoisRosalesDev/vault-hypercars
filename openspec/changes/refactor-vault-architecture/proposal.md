# OpenSpec Proposal: Refactoring & Reorganizing Vault Hypercars Architecture

**Change ID**: `refactor-vault-architecture`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)

---

## 1. Overview & Objective

The Vault Hypercars platform is currently structured with inline type definitions (`CatalogItem` inside `app/components/Catalogo.tsx`), inline mock datasets (`initialCatalogItems`), and monolithic page components (such as `app/admin/dashboard/page.tsx` spanning ~600 lines containing embedded form state, analytics, table rendering, and confirmation dialogs).

This proposal defines the structural reorganization and architectural refactoring of the Vault Hypercars codebase into a clean, modular domain architecture under `app/`:
1. **Domain & Data Layer**: `app/types/`, `app/data/`, `app/context/`, `app/hooks/`, `app/lib/`.
2. **Atomic & Feature Component Decomposition**: Navbar, Hero, ProductCard, CartDrawer, AdminModals (`ProductFormModal`, `ConfirmModal`, `DashboardAnalytics`, `CatalogTable`).
3. **Custom State & Currency Hooks**: Encapsulating cart persistence, currency rates, and formatting logic into `useHypercarCart`.

---

## 2. Technical Scope & Architecture Breakdown

```
vault-hypercars/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx   # Lightweight container composing Admin Modals & Analytics
│   │   └── login/page.tsx       # Secure Admin Login container
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminModals.tsx        # Form & Double Confirmation modal dialogs
│   │   │   ├── CatalogTable.tsx       # Catalog management table
│   │   │   └── DashboardAnalytics.tsx # Analytics metrics overview
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx         # Slide-over cart drawer with checkout
│   │   │   └── CartItemRow.tsx        # Individual cart item row
│   │   ├── catalog/
│   │   │   ├── CatalogFilter.tsx      # Brand selection filter (Bugatti, Lamborghini, Ferrari)
│   │   │   ├── CatalogGrid.tsx        # Responsive grid layout
│   │   │   ├── CatalogModal.tsx       # Hypercar detail modal
│   │   │   └── ProductCard.tsx        # Atomic hypercar card component
│   │   ├── layout/
│   │   │   ├── Hero.tsx               # Background video loop hero section
│   │   │   ├── Navbar.tsx             # Glassmorphism navbar & mobile menu toggle
│   │   │   └── SiteFooter.tsx         # Global footer with Admin link
│   │   └── ui/
│   │       ├── Icons.tsx              # Vector SVG icons
│   │       └── ToastNotification.tsx  # Floating notification toast
│   ├── context/
│   │   └── CartContext.tsx            # Context provider for shopping cart state
│   ├── data/
│   │   └── initialCatalog.ts          # Hypercar catalog static dataset (Bugatti, Lamborghini, Ferrari)
│   ├── hooks/
│   │   └── useHypercarCart.ts         # Custom hook encapsulating cart actions & currency conversion
│   ├── lib/
│   │   └── currency.ts                # Multi-currency rates (USD, EUR, GBP, AED) & formatting helpers
│   ├── types/
│   │   ├── admin.ts                   # Admin dashboard & modal form types
│   │   ├── cart.ts                    # Shopping cart & currency types
│   │   └── catalog.ts                 # Hypercar catalog item & brand types
│   ├── globals.css                    # Tailwind CSS v4 styling
│   ├── layout.tsx                     # Root layout & CartProvider wrapper
│   └── page.tsx                       # Customer landing page composing layout & catalog components
```

---

## 3. Key Refactoring Steps

### A. Domain Separation (`app/types/`, `app/data/`, `app/lib/`)
- Move `CatalogItem`, `Brand`, `ItemStatus` to `app/types/catalog.ts`.
- Move `CartItem`, `Currency`, `CurrencyRate` to `app/types/cart.ts`.
- Move `AdminModalAction`, `CatalogFormData` to `app/types/admin.ts`.
- Extract `initialCatalogItems` static hypercar records into `app/data/initialCatalog.ts`.
- Extract currency rates (`USD`, `EUR`, `GBP`, `AED`) and price conversion logic into `app/lib/currency.ts`.

### B. Custom Hooks Integration (`app/hooks/useHypercarCart.ts`)
- Implement `useHypercarCart` custom hook that exposes:
  - `cart`, `cartCount`, `addToCart`, `removeFromCart`, `clearCart`.
  - `currency`, `setCurrency`, `formatPrice`.
  - `isCartOpen`, `setIsCartOpen`, `toastMessage`.
- Decouple component render logic from context consumption boilerplate.

### C. Component Modularization & Atomic Decomposition
- **Layout & Landing**:
  - `Navbar.tsx`: Glassmorphism header with desktop links & mobile drawer toggle.
  - `Hero.tsx`: Video background loop banner (`/Futuristic Sports Car Racing Through Illuminated Tunnel.mp4`).
  - `ProductCard.tsx`: Individual hypercar card with specifications, price formatting, and "AÑADIR AL CARRITO" trigger.
  - `CartDrawer.tsx`: Cart slide-over with item quantity control and currency switcher.
- **Admin Portal**:
  - `DashboardAnalytics.tsx`: Inventory metrics, total value, active units.
  - `CatalogTable.tsx`: Hypercar inventory table with edit & delete actions.
  - `AdminModals.tsx`: Form modal (image URL/file upload) and secondary double-confirmation modal.

---

## 4. Requirements & Non-Functional Constraints

1. **Zero Visual/Functional Regression**: All brand filters, video loop background, shopping cart functionality, currency conversion, and admin double-confirmation modals must behave identically.
2. **Type Safety & Linting**: Codebase must pass `npx tsc --noEmit` and `pnpm lint` without warnings or errors.
3. **No External UI Dependencies**: Retain pure Tailwind CSS v4 and React 19 / Next.js 16 setup.
4. **No Emojis**: Retain vector SVG icon design system in `Icons.tsx`.

---

## 5. Task Breakdown & Implementation Plan

- [ ] **Phase 1: Types, Data, Utilities & Custom Hook Extraction**
  - Create `app/types/catalog.ts`, `app/types/cart.ts`, `app/types/admin.ts`.
  - Create `app/data/initialCatalog.ts` and `app/lib/currency.ts`.
  - Create `app/hooks/useHypercarCart.ts` and update `app/context/CartContext.tsx`.

- [ ] **Phase 2: Atomic Layout & Landing Component Extraction**
  - Extract `Navbar.tsx`, `Hero.tsx`, and `SiteFooter.tsx` into `app/components/layout/`.
  - Update `app/page.tsx` to compose clean layout components.

- [ ] **Phase 3: Catalog & Cart Feature Decomposition**
  - Extract `ProductCard.tsx`, `CatalogGrid.tsx`, `CatalogFilter.tsx`, and `CatalogModal.tsx` into `app/components/catalog/`.
  - Refactor `CartDrawer.tsx` and `CartItemRow.tsx` into `app/components/cart/`.

- [ ] **Phase 4: Admin Dashboard Deconstruct & Modals Decomposition**
  - Split `app/admin/dashboard/page.tsx` into `DashboardAnalytics.tsx`, `CatalogTable.tsx`, and `AdminModals.tsx` under `app/components/admin/`.
  - Refactor `app/admin/dashboard/page.tsx` into a lightweight container component.

- [ ] **Phase 5: Verification & Quality Assurance**
  - Verify type safety (`npx tsc --noEmit`).
  - Run lint verification (`pnpm lint`).
