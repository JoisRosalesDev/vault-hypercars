# OpenSpec Tasks: Stripe Checkout Integration, Stock Management & Real Analytics

**Change ID**: `stripe-checkout-stock-analytics`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  
**Status**: Pending  

---

## Task Overview

This document outlines the step-by-step implementation tasks to integrate Stripe Checkout, enforce explicit stock management, fix catalog brand filtering casing, introduce a live database analytics engine, and resolve mobile responsiveness issues in the admin dashboard. Execution is divided into eight sequential phases to guarantee transaction safety, race condition prevention, and TypeScript compliance.

---

## Phase 1: Database Schema & Seed Script Updates

- [ ] **Task 1.1: Extend Prisma Schema with Inventory Stock & Order Models**
  - Update [prisma/schema.prisma](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/prisma/schema.prisma).
  - Add `stock Int @default(1)` to the `Hypercar` model with indexes on `brand` and `status`.
  - Create the `Order` model with fields `id`, `stripeSessionId` (`@unique`), `idempotencyKey` (`@unique`), `customerEmail`, `totalAmount`, `currency` (`@default("usd")`), `status` (`"PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED"`), `createdAt`, `updatedAt`, and indexes on `stripeSessionId` and `status`.
  - Create the `OrderItem` model with fields `id`, `orderId`, `hypercarId`, `quantity` (`@default(1)`), `priceUSD`, with relation cascades and indexes on `orderId` and `hypercarId`.
  - *Verification*: Run `npx prisma validate` to confirm schema correctness without syntax or relation errors.

- [ ] **Task 1.2: Update Database Seed Script with Explicit Stock Counts**
  - Update [prisma/seed.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/prisma/seed.ts).
  - Include explicit numerical `stock` values (e.g., 1, 2, 3) for seeded hypercars.
  - Run database migration/push using `npx prisma db push` or `npx prisma migrate dev`.
  - *Verification*: Verify database tables `Hypercar`, `Order`, and `OrderItem` are created and populated via `npx prisma db seed`.

---

## Phase 2: Domain Type Definitions & Server SDK Setup

- [ ] **Task 2.1: Extend Catalog Domain Types**
  - Update [app/types/catalog.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/types/catalog.ts).
  - Add `stock: number` to the `CatalogItem` interface.
  - *Verification*: Run `npx tsc --noEmit` to verify type compilation.

- [ ] **Task 2.2: Extend Cart & Checkout Domain Types**
  - Update [app/types/cart.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/types/cart.ts).
  - Export interfaces `CheckoutItemPayload` (`{ id: string; quantity: number }`), `CheckoutPayload` (`{ items: CheckoutItemPayload[]; idempotencyKey: string }`), and `CheckoutResponse` (`{ url: string; sessionId: string }`).
  - *Verification*: Run `npx tsc --noEmit`.

- [ ] **Task 2.3: Extend Admin Domain Types**
  - Update [app/types/admin.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/types/admin.ts).
  - Add `stock: number` to `CatalogFormData`.
  - *Verification*: Run `npx tsc --noEmit`.

- [ ] **Task 2.4: Initialize Server-Side Stripe SDK Client**
  - Install dependencies `stripe` and `@stripe/stripe-js`.
  - Create [app/lib/stripe.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/lib/stripe.ts).
  - Export singleton `stripe` SDK instance configured with `process.env.STRIPE_SECRET_KEY` and API version `2023-10-16`.
  - *Verification*: Verify module exports `stripe` instance without runtime error warnings.

---

## Phase 3: Catalog Brand Tab Casing Normalization & API Filter Fix

- [ ] **Task 3.1: Normalize Brand State in UI Components**
  - Update [app/components/catalog/CatalogFilter.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/catalog/CatalogFilter.tsx) and [app/components/catalog/Catalogo.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/catalog/Catalogo.tsx).
  - Align selected brand values with database capitalization (`"Bugatti"`, `"Lamborghini"`, `"Ferrari"`, `"all"`).
  - Use `.toLowerCase()` comparison for active tab highlighting.
  - *Verification*: Confirm brand tab selection matches database values cleanly.

- [ ] **Task 3.2: Update Catalog API Route with Case-Insensitive Filtering**
  - Update [app/api/catalog/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/catalog/route.ts).
  - Apply `mode: "insensitive"` filter on Prisma `brand` query parameter when `brandFilter !== "all"`.
  - Include `stock` field in database query projection and response payload.
  - *Verification*: Query `/api/catalog?brand=bugatti` and `/api/catalog?brand=Bugatti` via curl or browser; verify both return Bugatti inventory items with `stock` field.

---

## Phase 4: Explicit Stock Management UI Integration

- [ ] **Task 4.1: Render Stock Badges & Out-of-Stock CTA Controls in ProductCard**
  - Update [app/components/catalog/ProductCard.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/catalog/ProductCard.tsx).
  - Render stock badges: Emerald for `stock > 1` (`Stock: {stock} u.`), Amber with pulsing dot for `stock === 1` (`¡Última unidad!`), and Rose for `stock === 0` (`AGOTADO`).
  - Disable `"AÑADIR AL CARRITO"` button when `stock === 0` with `disabled` attribute and muted styling.
  - *Verification*: Verify stock badges display accurately and CTA is disabled when stock is 0.

- [ ] **Task 4.2: Update Catalog Modal Specifications & Purchase Controls**
  - Update [app/components/catalog/CatalogModal.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/catalog/CatalogModal.tsx).
  - Add "Unidades en Inventario" line item in specifications list.
  - Disable `"COMPRAR AHORA Y AÑADIR AL CARRITO"` button when `stock === 0`.
  - *Verification*: Open modal for vehicle with 0 stock; verify status display and button disabled state.

- [ ] **Task 4.3: Add Stock Column to Admin Catalog Table**
  - Update [app/components/admin/CatalogTable.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/admin/CatalogTable.tsx).
  - Add `"STOCK"` header column and render `item.stock` with status-colored badge (`bg-rose-500/10 text-rose-400` for 0, `bg-[#08080a]` or `bg-zinc-800 text-white` for >0).
  - *Verification*: Check table renders stock column correctly.

- [ ] **Task 4.4: Add Stock Input Field to Admin Creation & Editing Forms**
  - Update [app/components/admin/AdminModals.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/admin/AdminModals.tsx).
  - Add required `<input type="number" min="0" name="stock" />` field in vehicle creation/editing modal forms.
  - Update [app/api/admin/cars/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/admin/cars/route.ts) and [app/api/admin/cars/[id]/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/admin/cars/[id]/route.ts) to parse and save `stock` values.
  - *Verification*: Create and edit a hypercar via admin panel; verify `stock` is saved to PostgreSQL and displayed in table.

---

## Phase 5: Stripe Checkout Session API & Cart Integration

- [ ] **Task 5.1: Implement Stripe Checkout Session API Endpoint with Idempotency Guard**
  - Create [app/api/checkout/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/checkout/route.ts).
  - Configure route segment options (`export const dynamic = "force-dynamic"`, `export const maxDuration = 10`).
  - Add sliding-window rate limit guard (60 req/min per IP).
  - Execute pre-checkout stock check inside atomic `prisma.$transaction`: verify `car.stock >= item.quantity` for each cart item; throw error if stock is insufficient.
  - Invoke `stripe.checkout.sessions.create` passing `idempotencyKey: cs_${idempotencyKey}` in request options.
  - Pre-record `Order` in database with status `"PENDING"` and associated `OrderItem` records.
  - Return `{ url, sessionId }`.
  - *Verification*: Test `POST /api/checkout` with invalid stock quantity; verify endpoint returns 400 error. Test with valid payload; verify return of valid Stripe Checkout URL.

- [ ] **Task 5.2: Connect Cart Drawer Checkout Trigger to Stripe Gateway**
  - Update [app/hooks/useHypercarCart.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/hooks/useHypercarCart.ts) and [app/components/cart/CartDrawer.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/cart/CartDrawer.tsx).
  - Replace alert dialog with checkout invocation: generate client-side UUID idempotency key (`crypto.randomUUID()`), send POST payload to `/api/checkout`, handle loading/error states, and perform redirect via `window.location.href = data.url`.
  - *Verification*: Click checkout button in cart drawer; verify loading indicator activates and browser redirects to Stripe hosted payment page.

---

## Phase 6: Stripe Webhook Listener Implementation

- [ ] **Task 6.1: Implement Stripe Webhook Endpoint for Session Completion & Expiration**
  - Create [app/api/webhooks/stripe/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/webhooks/stripe/route.ts).
  - Construct Stripe event from raw body text and `stripe-signature` header using `stripe.webhooks.constructEvent`.
  - Handle `checkout.session.completed`: inside atomic `prisma.$transaction`, update `Order` status to `"COMPLETED"`, record `customerEmail`, decrement `Hypercar.stock` by `item.quantity`, and adjust `Hypercar.status` (`"Vendido"` if stock <= 0, `"Unidad Final"` if stock === 1).
  - Handle `checkout.session.expired`: update `Order` status to `"EXPIRED"`.
  - *Verification*: Trigger webhook via Stripe CLI (`stripe trigger checkout.session.completed`); verify database `Order` status updates to `COMPLETED` and `Hypercar.stock` decrements.

---

## Phase 7: Real Data Analytics Engine & Admin Dashboard Responsive Header Fix

- [ ] **Task 7.1: Create Dynamic Database Analytics API Endpoint**
  - Create [app/api/admin/analytics/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/admin/analytics/route.ts).
  - Protect route with `getAdminSession(req)` and sliding-window rate limiter (30 req/min).
  - Dynamically compute metrics: `totalInventoryUSD` (sum of `price * stock` for active cars), `activeUnitsCount` (sum of `stock` where stock > 0), `monthlyRevenueUSD` (sum of `totalAmount` for completed orders in current month), and `conversionRate` (`completedOrders / totalOrders * 100`).
  - *Verification*: Perform GET request to `/api/admin/analytics` with admin session cookie; verify response contains accurate metrics JSON payload.

- [ ] **Task 7.2: Update Dashboard Analytics Component to Display Dynamic Metrics**
  - Update [app/components/admin/DashboardAnalytics.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/admin/DashboardAnalytics.tsx).
  - Render metric cards formatted in millions USD and percentage format based on API response payload.
  - *Verification*: Check admin dashboard analytics cards render live values without fallback to static mock figures.

- [ ] **Task 7.3: Refactor Admin Dashboard Header for Mobile Responsiveness**
  - Update [app/admin/dashboard/page.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/admin/dashboard/page.tsx).
  - Refactor `<header>` flex layout: use `flex-col sm:flex-row`, `justify-between`, `items-start sm:items-center`, `gap-4`, and flex shrink utility classes (`shrink-0`) to ensure title, badge, and logout link format cleanly across mobile (320px - 640px) and desktop viewports.
  - Implement dynamic analytics fetching via `useCallback` and `useEffect`.
  - *Verification*: Inspect header layout at 320px, 375px, and 768px viewport widths; verify zero text truncation or horizontal overflow scrollbars.

---

## Phase 8: Environment Setup & Final Quality Assurance

- [ ] **Task 8.1: Update Environment Variable Template**
  - Update [.env.example](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/.env.example).
  - Include reference keys: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
  - *Verification*: Confirm `.env.example` contains all required Stripe keys with descriptions.

- [ ] **Task 8.2: Workspace TypeScript & Lint Compliance Verification**
  - Run `npx tsc --noEmit` across the workspace.
  - Run `pnpm lint` (or `npm run lint`).
  - Fix any syntax errors, unused imports, or missing prop types.
  - *Verification*: Commands exit cleanly with code 0.
