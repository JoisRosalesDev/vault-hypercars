# OpenSpec Proposal: Stripe Checkout Integration, Stock Management & Real Analytics

**Change ID**: `stripe-checkout-stock-analytics`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  

---

## 1. Overview & Change Intent

The Vault Hypercars platform currently allows users to view hypercar details and add items to a local client-side cart drawer. However, purchase actions are simulated via simple alert dialogs without backend processing or transaction safety. Additionally, inventory items lack explicit stock quantities, brand filtering tabs suffer from string casing mismatches (`"bugatti"` vs `"Bugatti"`), admin analytics rely on hardcoded financial values, and the admin dashboard header text overflows on mobile viewports.

This proposal specifies the architecture and technical requirements to transform Vault Hypercars into a robust, transaction-safe e-commerce experience:

1. **Stripe Payment Gateway Integration**:
   - Integrate Stripe Checkout Sessions API with mandatory `idempotencyKey` headers/options to block duplicate charges from rapid button clicks or network retries.
   - Implement pre-checkout race condition prevention using atomic Prisma database transactions (`prisma.$transaction`) verifying `stock >= quantity` prior to session creation.
   - Deploy a dedicated Stripe Webhook endpoint (`/api/webhooks/stripe`) handling `checkout.session.completed` (decrements database stock, records order) and `checkout.session.expired` (releases stock reservations).
2. **Fix Catalog Brand Tab Filtering**:
   - Resolve casing and normalization mismatches across `CatalogFilter`, `Catalogo`, and `/api/catalog` so selecting Bugatti, Lamborghini, or Ferrari filters vehicles accurately without returning zero items.
3. **Explicit Stock Management**:
   - Add `stock: Int` to the `Hypercar` model in `prisma/schema.prisma`.
   - Render live stock badges and stock level indicators in `ProductCard`, `CatalogModal`, and `CatalogTable`, disabling cart actions when inventory reaches 0.
4. **Real Data Analytics Engine**:
   - Dynamically compute Admin Dashboard analytics directly from live database tables (real total inventory valuation `sum(price * stock)`, active inventory units count, and actual completed revenue from Stripe orders).
5. **Admin Dashboard Header Responsive Layout Fix**:
   - Refactor `<header>` responsive flex layout and text truncation rules in `app/admin/dashboard/page.tsx` to fix text overflow and optimize button alignment across mobile and desktop viewports.

---

## 2. Technical Architecture & Component Tree

```
vault-hypercars/
├── prisma/
│   ├── schema.prisma                  # Updated with stock field on Hypercar, Order & OrderItem models
│   └── seed.ts                        # Production seed updated with explicit stock values
├── app/
│   ├── api/
│   │   ├── catalog/
│   │   │   └── route.ts               # Case-insensitive brand filter & stock selection
│   │   ├── checkout/
│   │   │   └── route.ts               # Stripe Checkout session API with idempotency & stock pre-check
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts           # Webhook processing checkout.session.completed & expired
│   │   ├── admin/
│   │   │   ├── cars/
│   │   │   │   ├── route.ts           # Admin CRUD updated for stock management
│   │   │   │   └── [id]/route.ts
│   │   │   └── analytics/
│   │   │       └── route.ts           # Live dynamic metrics API endpoint
│   ├── lib/
│   │   ├── stripe.ts                  # Stripe SDK instance & server configuration
│   │   ├── prisma.ts                  # Global Prisma client singleton instance
│   │   └── auth.ts                    # Admin session helper
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx               # Responsive layout fix & dynamic analytics fetch
│   ├── components/
│   │   ├── catalog/
│   │   │   ├── CatalogFilter.tsx      # Case-normalized brand selection tabs
│   │   │   ├── Catalogo.tsx           # Normalized query parameter fetching
│   │   │   ├── ProductCard.tsx        # Stock badge display & out-of-stock button handling
│   │   │   └── CatalogModal.tsx       # Live stock badge & purchase availability validation
│   │   ├── admin/
│   │   │   ├── CatalogTable.tsx       # Stock column display & inventory status badges
│   │   │   ├── AdminModals.tsx        # Stock input field in vehicle creation/editing
│   │   │   └── DashboardAnalytics.tsx # Live metrics renderer (inventory value, units, revenue)
│   │   └── cart/
│   │       └── CartDrawer.tsx         # Stripe Checkout trigger with idempotency key generation
│   └── types/
│       ├── catalog.ts                 # CatalogItem extended with stock: number
│       ├── cart.ts                    # Checkout payload & idempotency types
│       └── admin.ts                   # DashboardMetrics updated for live database figures
├── .env.example                       # Reference environment variables (Stripe keys included)
└── openspec/
    └── changes/
        └── stripe-checkout-stock-analytics/
            └── proposal.md            # This proposal specification document
```

---

## 3. Detailed Technical Specifications

### 3.1 Database Schema & Stock Management (`prisma/schema.prisma`)

#### Hypercar Model Update
Extend the `Hypercar` model to incorporate explicit stock inventory:
```prisma
model Hypercar {
  id           String   @id @default(cuid())
  name         String
  brand        String   // "Bugatti" | "Lamborghini" | "Ferrari"
  year         Int
  price        Float    // Base price in USD
  stock        Int      @default(1) // Available units in inventory
  hp           Int
  topSpeed     String
  acceleration String
  engine       String
  status       String   // "Disponible" | "Unidad Final" | "Reservado" | "Vendido"
  image        String
  description  String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  orderItems   OrderItem[]

  @@index([brand])
  @@index([status])
}
```

#### Order & OrderItem Models
Introduce `Order` and `OrderItem` models to track Stripe purchase transactions and calculate real revenue:
```prisma
model Order {
  id                String      @id @default(cuid())
  stripeSessionId   String      @unique
  idempotencyKey    String      @unique
  customerEmail     String?
  totalAmount       Float       // Total order amount in USD
  currency          String      @default("usd")
  status            String      // "PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED"
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  items             OrderItem[]

  @@index([stripeSessionId])
  @@index([status])
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  hypercarId String
  quantity   Int      @default(1)
  priceUSD   Float

  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  hypercar   Hypercar @relation(fields: [hypercarId], references: [id])
}
```

---

### 3.2 Stripe Checkout Sessions API & Idempotency Key Integration (`app/api/checkout/route.ts` & `app/lib/stripe.ts`)

#### Server-Side Stripe SDK Client (`app/lib/stripe.ts`)
```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
  typescript: true,
});
```

#### Checkout Session Route (`app/api/checkout/route.ts`)
- **Endpoint**: `POST /api/checkout`
- **Request Body**:
  ```json
  {
    "items": [{ "id": "car_cuid_1", "quantity": 1 }],
    "idempotencyKey": "uuid-v4-unique-checkout-key"
  }
  ```
- **Transaction Safety & Stock Race Condition Guard**:
  Before calling Stripe, execute an atomic Prisma interactive transaction (`prisma.$transaction`) to check current inventory:
  ```ts
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const car = await tx.hypercar.findUnique({ where: { id: item.id } });
      if (!car || car.stock < item.quantity) {
        throw new Error(`Inventario insuficiente para el vehículo: ${car?.name || item.id}`);
      }
    }
  });
  ```
- **Stripe Idempotency Enforcement**:
  Pass `idempotencyKey` directly into the Stripe Checkout session creation request options:
  ```ts
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      metadata: { idempotencyKey },
    },
    {
      idempotencyKey: `cs_${idempotencyKey}`, // Prevents duplicate session creation on button spam
    }
  );
  ```
- **Pending Order Pre-Recording**:
  Record the `Order` in database with status `"PENDING"` linked to `session.id` and `idempotencyKey`.

---

### 3.3 Stripe Webhook Handler (`app/api/webhooks/stripe/route.ts`)

- **Endpoint**: `POST /api/webhooks/stripe`
- **Signature Verification**: Construct event using `stripe.webhooks.constructEvent(bodyText, signature, process.env.STRIPE_WEBHOOK_SECRET!)`.
- **Event Handling Specs**:
  1. `checkout.session.completed`:
     - Retrieve `session.id` and metadata.
     - Execute inside atomic `prisma.$transaction`:
       - Update `Order` status to `"COMPLETED"` and record `customerEmail`.
       - For each item in the order, decrement `Hypercar.stock` by quantity:
         ```ts
         await tx.hypercar.update({
           where: { id: item.hypercarId },
           data: {
             stock: { decrement: item.quantity },
           },
         });
         ```
       - Evaluate remaining `stock`: If `stock <= 0`, update `Hypercar.status` to `"Vendido"`. If `stock === 1`, update `Hypercar.status` to `"Unidad Final"`.
  2. `checkout.session.expired`:
     - Update `Order` status to `"EXPIRED"`.
     - Release any associated pending reservation locks.

---

### 3.4 Catalog Brand Tab Casing & Normalization Fix (`CatalogFilter.tsx`, `Catalogo.tsx`, `/api/catalog/route.ts`)

#### Cause Analysis
Currently, `CatalogFilter.tsx` defines tab IDs as `"bugatti"`, `"lamborghini"`, `"ferrari"` (lowercased), while database `Hypercar` records store `brand` as `"Bugatti"`, `"Lamborghini"`, `"Ferrari"` (capitalized). Passing `?brand=bugatti` to `/api/catalog/route.ts` causes an exact match query `where: { brand: "bugatti" }`, returning 0 hypercars.

#### Normalization Strategy
1. **Frontend (`CatalogFilter.tsx` & `Catalogo.tsx`)**:
   - Standardize selected brand state values to match database casing (`"Bugatti"`, `"Lamborghini"`, `"Ferrari"`, `"all"`).
   - Normalize string comparisons using `.toLowerCase()` when matching active UI tab highlighting.
2. **API Route (`app/api/catalog/route.ts`)**:
   - Apply case-insensitive filtering or explicit brand mapping:
     ```ts
     if (brandFilter && brandFilter.toLowerCase() !== "all") {
       whereClause.brand = {
         equals: brandFilter,
         mode: "insensitive"
       };
     }
     ```

---

### 3.5 Explicit Stock Management UI Integration

#### `ProductCard.tsx`
- Render a live stock status badge:
  - If `stock > 1`: Display green/emerald badge: `Stock: {stock} unidades`.
  - If `stock === 1`: Display amber badge: `¡Última unidad disponible!`.
  - If `stock === 0`: Display rose badge: `AGOTADO` and disable the `"AÑADIR AL CARRITO"` CTA button with `disabled` attribute and muted styling.

#### `CatalogModal.tsx`
- Display stock count inside the vehicle specification list.
- If `stock === 0`, disable the `"COMPRAR AHORA Y AÑADIR AL CARRITO"` action button.

#### `CatalogTable.tsx` & `AdminModals.tsx`
- Add `"STOCK"` column in `CatalogTable` displaying current integer quantity.
- Include a required numerical `<input type="number" min="0" name="stock" />` field in creation and editing modal forms inside `AdminModals.tsx`.

---

### 3.6 Dynamic Real Data Analytics (`app/api/admin/analytics/route.ts` & `DashboardAnalytics.tsx`)

#### Analytics Calculations
Calculate metric cards dynamically from live PostgreSQL tables instead of hardcoded numbers:
1. **Total Inventory Value (`totalInventoryUSD`)**:
   - Sum of `(price * stock)` across all non-sold hypercars in the database.
2. **Active Units (`activeUnitsCount`)**:
   - Total count of available hypercar units (`sum(stock)` where `stock > 0`).
3. **Real Monthly Revenue (`monthlyRevenueUSD`)**:
   - Aggregated `totalAmount` of all `Order` records where `status = 'COMPLETED'` created within the current calendar month.
4. **Conversion Rate (`conversionRate`)**:
   - Calculated as `(completedOrdersCount / totalOrdersCount) * 100` (default to 0.0% if zero orders exist).

---

### 3.7 Admin Dashboard Header Responsive Layout Fix (`app/admin/dashboard/page.tsx`)

#### Responsive Layout Refactoring
Refactor the `<header>` element to prevent text truncation, overflow, and misaligned buttons on small screens (mobile viewports 320px - 640px):

```tsx
<header className="border-b border-white/10 bg-[#0c0c10] px-4 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
    <Link href="/" className="flex flex-col shrink-0">
      <span className="text-lg sm:text-xl font-black tracking-[0.25em] text-[#f5d061]">VAULT</span>
      <span className="text-[8px] tracking-[0.4em] text-zinc-400">HYPERCARS ADMIN</span>
    </Link>
    <span className="px-2.5 sm:px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shrink-0">
      <LockIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> PANEL DE ADMINISTRACIÓN
    </span>
  </div>

  <Link href="/" className="text-xs text-zinc-400 hover:text-white font-semibold self-end sm:self-auto shrink-0">
    CERRAR SESIÓN →
  </Link>
</header>
```

---

## 4. Production Environment Configuration (`.env.example`)

The `.env.example` template will be updated with essential Stripe credentials:

```env
# ==========================================
# VAULT HYPERCARS - PRODUCTION ENVIRONMENT VARIABLES
# ==========================================

# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres"

# NextAuth / Auth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-32-character-string"
ADMIN_ALLOWED_EMAIL="joisrosafer@gmail.com"

# Stripe Payment Gateway Credentials
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
```

---

## 5. Impact & Refactoring Strategy

### Dependencies to Install
- `stripe`: Node.js server SDK for Stripe Checkout and Webhooks.
- `@stripe/stripe-js`: Client SDK helper for redirecting to Stripe Checkout.

### Codebase Changes Summary
1. `prisma/schema.prisma`: Add `stock` to `Hypercar`, create `Order` and `OrderItem` models.
2. `app/lib/stripe.ts`: Initialize server-side Stripe SDK.
3. `app/api/checkout/route.ts`: Create checkout session endpoint with idempotency key and stock pre-check.
4. `app/api/webhooks/stripe/route.ts`: Webhook listener for payment completion & expiration.
5. `app/api/catalog/route.ts`: Add case-insensitive brand filtering & stock field return.
6. `app/api/admin/analytics/route.ts`: Create dynamic analytics calculation API endpoint.
7. `app/components/catalog/CatalogFilter.tsx` & `Catalogo.tsx`: Fix brand string normalization.
8. `app/components/catalog/ProductCard.tsx` & `CatalogModal.tsx`: Render stock badges and disable cart CTAs when stock is 0.
9. `app/components/admin/CatalogTable.tsx`, `AdminModals.tsx`, `DashboardAnalytics.tsx`: Integrate stock column, stock form input, and dynamic metrics.
10. `app/admin/dashboard/page.tsx`: Fix header text overflow and responsive button positioning.

---

## 6. Verification & Quality Assurance Plan

1. **Database Schema & Type Safety**:
   - Run `npx prisma validate` to confirm schema validity.
   - Run `npx tsc --noEmit` to verify full TypeScript compliance across modified components.
2. **Brand Filtering Verification**:
   - Click "BUGATTI", "LAMBORGHINI", and "FERRARI" tabs in the catalog UI.
   - Verify that hypercars corresponding to each brand are retrieved and displayed accurately.
3. **Idempotency & Race Condition Verification**:
   - Simulate rapid double-clicks on the checkout button; confirm single Stripe Checkout session creation using idempotency key.
   - Test simultaneous checkout requests for a vehicle with `stock = 1`; verify `prisma.$transaction` permits the first request and rejects the second with an out-of-stock error.
4. **Webhook & Stock Decrement Verification**:
   - Trigger Stripe webhook `checkout.session.completed` locally via Stripe CLI (`stripe trigger checkout.session.completed`).
   - Verify `Order` status updates to `COMPLETED`, `stock` is decremented in PostgreSQL, and status switches to `"Vendido"` when `stock` reaches 0.
5. **Analytics & Responsive UI Verification**:
   - Verify Admin Dashboard metric cards calculate dynamic values matching database records.
   - Test `app/admin/dashboard/page.tsx` header on mobile viewports (320px, 375px, 414px) to ensure zero text clipping or horizontal scrollbars.
6. **Linting Compliance**:
   - Run `pnpm lint` to ensure 0 lint errors or warnings.

---

## 7. Task Breakdown & Implementation Checklist

- [ ] **Phase 1: Prisma Schema & Stock Model Extension**
  - Add `stock: Int` to `Hypercar` model in `prisma/schema.prisma`.
  - Add `Order` and `OrderItem` models.
  - Update `prisma/seed.ts` with explicit stock counts.
  - Run database migration/push.

- [ ] **Phase 2: Brand Tab Normalization Fix**
  - Update `CatalogFilter.tsx` and `Catalogo.tsx` brand state handling.
  - Update `app/api/catalog/route.ts` with case-insensitive brand querying.

- [ ] **Phase 3: Stock Management UI Integration**
  - Extend `CatalogItem` type definition in `app/types/catalog.ts`.
  - Update `ProductCard.tsx` and `CatalogModal.tsx` with stock badges and CTA disable states.
  - Update `CatalogTable.tsx` and `AdminModals.tsx` with stock display and editing capabilities.

- [ ] **Phase 4: Stripe Checkout API & Idempotency Key Guard**
  - Install `stripe` and `@stripe/stripe-js`.
  - Create `app/lib/stripe.ts`.
  - Create `app/api/checkout/route.ts` with atomic `prisma.$transaction` stock pre-check and Stripe idempotency keys.
  - Wire `CartDrawer.tsx` checkout button to trigger Stripe Checkout.

- [ ] **Phase 5: Stripe Webhook Handler Implementation**
  - Create `app/api/webhooks/stripe/route.ts`.
  - Implement `checkout.session.completed` handler (stock decrement & status update).
  - Implement `checkout.session.expired` handler.

- [ ] **Phase 6: Real Data Analytics Engine & Dashboard Header Responsive Fix**
  - Create `/api/admin/analytics/route.ts` computing metrics from DB.
  - Update `DashboardAnalytics.tsx` to display live dynamic metrics.
  - Refactor `<header>` in `app/admin/dashboard/page.tsx` for responsive mobile layout.

- [ ] **Phase 7: Final QA Verification & Type Checking**
  - Update `.env.example` with Stripe environment variables.
  - Execute `npx tsc --noEmit` and `pnpm lint`.
