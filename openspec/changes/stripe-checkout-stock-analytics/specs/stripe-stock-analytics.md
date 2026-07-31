# OpenSpec Delta Specification: Stripe Checkout Integration, Stock Management & Real Analytics

**Change ID**: `stripe-checkout-stock-analytics`  
**Target Module**: Vault Hypercars (`vault-hypercars`)  
**Store Mode**: `hybrid`  

---

## 1. Stripe Checkout Session & Webhook API Specifications

### 1.1 Server-Side Stripe Client Setup (`app/lib/stripe.ts`)
- The server initializes the official Node.js Stripe SDK using `process.env.STRIPE_SECRET_KEY`.
- API version is fixed to `"2023-10-16"` with TypeScript support enabled.

### 1.2 Checkout Session API Endpoint (`app/api/checkout/route.ts`)
- **HTTP Method**: `POST`
- **Authentication**: Public / Session-based cart checkout.
- **Request Payload**:
  ```json
  {
    "items": [
      { "id": "car_cuid_123", "quantity": 1 }
    ],
    "idempotencyKey": "uuid-v4-client-generated-key"
  }
  ```
- **Atomic Concurrency & Stock Race Condition Prevention**:
  1. Prior to inviting Stripe, execute an interactive Prisma transaction (`prisma.$transaction`) to inspect live inventory for each requested item.
  2. If any vehicle record has `stock < requestedQuantity` or is missing, immediately abort with HTTP 400 Bad Request and error payload: `{"error": "Inventario insuficiente para el vehículo: <name>"}`.
- **Stripe Idempotency Enforcement**:
  1. Pass client header/payload `idempotencyKey` directly into the Stripe Checkout session creation request options object `{ idempotencyKey: `cs_${idempotencyKey}` }`.
  2. This guarantees that duplicated HTTP POST retries or double-clicks produce the exact same Stripe Checkout session response without creating redundant checkout URLs or charging the customer multiple times.
- **Pending Order Pre-Registration**:
  - Insert an `Order` record in database with status `"PENDING"`, referencing `stripeSessionId` and `idempotencyKey`.

### 1.3 Stripe Webhook Event Handler (`app/api/webhooks/stripe/route.ts`)
- **HTTP Method**: `POST`
- **Webhook Secret Verification**:
  - Read raw request body stream and header `stripe-signature`.
  - Validate authenticity using `stripe.webhooks.constructEvent(bodyText, signature, process.env.STRIPE_WEBHOOK_SECRET!)`.
  - Invalid signature returns HTTP 400 `Webhook Error: Signature verification failed`.
- **Event Handling Specifications**:
  1. **`checkout.session.completed`**:
     - Extract `session.id` and customer metadata.
     - Execute inside an atomic `prisma.$transaction`:
       - Update corresponding `Order` status to `"COMPLETED"` and save `customerEmail`.
       - For each item in `Order`, perform explicit atomic decrement:
         ```ts
         await tx.hypercar.update({
           where: { id: item.hypercarId },
           data: { stock: { decrement: item.quantity } }
         });
         ```
       - Check resulting stock level:
         - If `stock <= 0`, set `Hypercar.status = "Vendido"`.
         - If `stock === 1`, set `Hypercar.status = "Unidad Final"`.
  2. **`checkout.session.expired`**:
     - Locate `Order` by `stripeSessionId`.
     - Update `Order.status = "EXPIRED"` and release pending inventory holds.

---

## 2. Prisma Stock Schema & UI Badge Specifications

### 2.1 Prisma Database Schema Extensions (`prisma/schema.prisma`)
- Extend `Hypercar` model:
  - Add `stock Int @default(1)`.
  - Add `orderItems OrderItem[]` relation.
- Add `Order` model:
  - `id String @id @default(cuid())`
  - `stripeSessionId String @unique`
  - `idempotencyKey String @unique`
  - `customerEmail String?`
  - `totalAmount Float`
  - `currency String @default("usd")`
  - `status String` (`"PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED"`)
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `items OrderItem[]`
- Add `OrderItem` model:
  - `id String @id @default(cuid())`
  - `orderId String`
  - `hypercarId String`
  - `quantity Int @default(1)`
  - `priceUSD Float`
  - Relations: `order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)` and `hypercar Hypercar @relation(fields: [hypercarId], references: [id])`.

### 2.2 UI Stock Badges & CTA Rules
- **`ProductCard.tsx`**:
  - `stock > 1`: Display emerald/green badge with `Stock: {stock} unidades`.
  - `stock === 1`: Display amber badge with `¡Última unidad disponible!`.
  - `stock === 0`: Display rose badge with `AGOTADO`, and disable the `"AÑADIR AL CARRITO"` CTA button with `disabled` attribute and muted styling.
- **`CatalogModal.tsx`**:
  - Render explicit stock inventory count in vehicle details list.
  - If `stock === 0`, disable the `"COMPRAR AHORA Y AÑADIR AL CARRITO"` button.
- **`CatalogTable.tsx` & `AdminModals.tsx`**:
  - Add `"STOCK"` column displaying integer count.
  - Include required numerical input field `<input type="number" min="0" name="stock" />` in create and edit modal dialogs.

---

## 3. Brand Filtering Normalization Specification

### 3.1 Casing Normalization (`CatalogFilter.tsx`, `Catalogo.tsx`)
- Standardize selected brand tab values and active UI comparisons by applying `.toLowerCase()` checks when determining active tab highlights.
- Supported tab values: `"all"`, `"Bugatti"`, `"Lamborghini"`, `"Ferrari"`.

### 3.2 Backend Query Normalization (`app/api/catalog/route.ts`)
- Modify brand query parameter handling in Prisma filter clause:
  ```ts
  if (brandFilter && brandFilter.toLowerCase() !== "all") {
    whereClause.brand = {
      equals: brandFilter,
      mode: "insensitive"
    };
  }
  ```
- This ensures querying `?brand=bugatti`, `?brand=BUGATTI`, or `?brand=Bugatti` consistently returns Bugatti inventory without zero-item mismatches.

---

## 4. Real-Time Analytics Endpoint & Admin Header Responsive Specs

### 4.1 Real-Time Analytics API Endpoint (`app/api/admin/analytics/route.ts`)
- **HTTP Method**: `GET`
- **Authentication**: Protected via `getAdminSession()`.
- **Dynamic Valuation & Metrics Math**:
  1. **`totalInventoryUSD`**: Sum of `(price * stock)` for all hypercars with `stock > 0` and status `!= "Vendido"`.
  2. **`activeUnitsCount`**: Aggregate sum of all available `stock` units across non-sold inventory.
  3. **`monthlyRevenueUSD`**: Aggregate sum of `totalAmount` from `Order` records where `status === "COMPLETED"` created within the current calendar month (`createdAt >= startOfMonth`).
  4. **`conversionRate`**: `(completedOrdersCount / totalOrdersCount) * 100` (formatted to 1 decimal place, returning `0.0` when total orders equal 0).

### 4.2 Admin Dashboard Header Responsive Layout (`app/admin/dashboard/page.tsx`)
- Container `<header>` uses Tailwind classes: `border-b border-white/10 bg-[#0c0c10] px-4 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`.
- Left brand/title block uses `flex flex-wrap items-center gap-3 sm:gap-4` with `shrink-0` on elements to prevent line-wrapping clipping on mobile screens (320px–640px).
- Right-hand action (`CERRAR SESIÓN →`) sets `self-end sm:self-auto shrink-0` to maintain alignment on mobile displays without clipping or triggering horizontal page scrollbars.
