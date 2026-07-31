# OpenSpec Specification: Vault Hypercars Platform

**Version**: 3.1.0  
**Architecture Pattern**: Domain-Layered Modular Architecture & Full-Stack API Integration  
**Target Project**: Vault Hypercars (`vault-hypercars`)

---

## 1. System Overview & Architecture Guidelines

The Vault Hypercars platform is designed around a modular domain-layered architecture with full-stack Next.js App Router integrations. It separates frontend presentational concerns from persistent backend data storage, strictly typed REST API routes, Stripe payment gateway transactions, explicit stock management, real-time database analytics, and enterprise security guarantees (NextAuth Google OAuth strict authorization, sliding-window rate limiting, and execution timeouts).

```
vault-hypercars/
├── prisma/
│   ├── schema.prisma            # Prisma schema (Hypercar with stock, Order, OrderItem, Auth models)
│   └── seed.ts                  # Production dataset seeding script with stock values
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth handler with strict Google OAuth callback
│   │   ├── catalog/
│   │   │   └── route.ts         # Public GET catalog API endpoint with mode: 'insensitive' brand filter
│   │   ├── checkout/
│   │   │   └── route.ts         # Stripe Checkout session creation API with idempotency & stock pre-check
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts     # Stripe webhook endpoint (checkout.session.completed & expired)
│   │   └── admin/
│   │       ├── cars/
│   │       │   ├── route.ts     # Protected GET & POST hypercar endpoint with stock management
│   │       │   └── [id]/
│   │       │       └── route.ts # Protected PUT & DELETE hypercar endpoint
│   │       └── analytics/
│   │           └── route.ts     # Protected live database analytics calculation endpoint
│   ├── admin/
│   │   ├── dashboard/page.tsx   # Admin dashboard with responsive header & live analytics
│   │   └── login/page.tsx       # Google OAuth Admin Login page component
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminModals.tsx        # Form Modal & Confirmation Dialogs with stock input field
│   │   │   ├── CatalogTable.tsx       # Live hypercar inventory table with stock column & CRUD
│   │   │   └── DashboardAnalytics.tsx # Real-time dynamic database metrics renderer
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx         # Slide-over cart drawer with Stripe Checkout trigger
│   │   │   └── CartItemRow.tsx        # Cart item row component with quantity control
│   │   ├── catalog/
│   │   │   ├── CatalogFilter.tsx      # Case-normalized brand selection tabs
│   │   │   ├── CatalogGrid.tsx        # Responsive hypercar grid fetching live from /api/catalog
│   │   │   ├── CatalogModal.tsx       # Detailed specifications viewer modal with stock badge
│   │   │   └── ProductCard.tsx        # Atomic hypercar card with live stock badge & CTA rules
│   │   ├── layout/
│   │   │   ├── Hero.tsx               # Full-bleed video background hero banner
│   │   │   ├── Navbar.tsx             # Glassmorphism header with mobile drawer
│   │   │   └── SiteFooter.tsx         # Footer with discrete Admin link
│   │   └── ui/
│   │       ├── Icons.tsx              # Vector SVG icon library
│   │       └── ToastNotification.tsx  # Global feedback toast notification
│   ├── context/
│   │   └── CartContext.tsx            # Context provider for global cart state
│   ├── hooks/
│   │   └── useHypercarCart.ts         # Custom hook encapsulating cart actions & currency logic
│   ├── lib/
│   │   ├── auth.ts                    # NextAuth options & admin session helper (getAdminSession)
│   │   ├── currency.ts                # Multi-currency rates & price formatting helpers
│   │   ├── prisma.ts                  # Singleton Prisma Client instance
│   │   ├── rate-limit.ts              # Sliding-window IP/session rate limiter guard
│   │   ├── stripe.ts                  # Server-side Stripe SDK instance initialization
│   │   └── timeout.ts                 # Route execution timeout wrapper (10s max duration)
│   ├── types/
│   │   ├── admin.ts                   # Admin dashboard & modal form type definitions
│   │   ├── cart.ts                    # Cart state, items, idempotency & checkout types
│   │   └── catalog.ts                 # Catalog item with stock, brand & status type definitions
│   ├── globals.css                    # Tailwind CSS v4 styling rules
│   ├── layout.tsx                     # Root layout with CartProvider wrapper
│   └── page.tsx                       # Customer landing page composing layout & catalog components
├── .env.example                       # Reference environment variable template with Stripe credentials
└── openspec/                          # SDD specifications & change tracking
```

---

## 2. Domain & Persistence Specifications

### 2.1 Prisma PostgreSQL Schema (`prisma/schema.prisma` & `app/lib/prisma.ts`)
- **Database Provider**: PostgreSQL (Supabase with `DATABASE_URL` pooling & `DIRECT_URL` migration connection).
- **Models**:
  - `Hypercar`: Primary vehicle inventory record (`id`, `name`, `brand`, `year`, `price`, `stock`, `hp`, `topSpeed`, `acceleration`, `engine`, `status`, `image`, `description`, `createdAt`, `updatedAt`).
    - `stock: Int @default(1)` specifies available inventory.
  - `Order`: Purchase transaction record (`id`, `stripeSessionId`, `idempotencyKey`, `customerEmail`, `totalAmount`, `currency`, `status`, `createdAt`, `updatedAt`).
    - `status`: `"PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED"`.
  - `OrderItem`: Line items associated with an order (`id`, `orderId`, `hypercarId`, `quantity`, `priceUSD`).
  - `User`, `Account`, `Session`, `VerificationToken`: NextAuth standard authentication & user session models.
- **Singleton Client**: Global `prisma` client instance stored on `globalThis` to prevent connection leaks during Next.js hot module reloads.

### 2.2 Catalog Domain (`app/types/catalog.ts`)
- **Types**:
  - `Brand`: `'Bugatti' | 'Lamborghini' | 'Ferrari' | 'All'`
  - `ItemStatus`: `'Disponible' | 'Unidad Final' | 'Reservado' | 'Vendido'`
  - `HypercarSpecs`: Object specifying performance details (`hp`, `topSpeed`, `acceleration`, `engine`).
  - `CatalogItem`: Interface matching the database payload schema, extending with `stock: number`.

### 2.3 Cart, Currency & Checkout Domain (`app/types/cart.ts` & `app/lib/currency.ts`)
- **Types**:
  - `Currency`: `'USD' | 'EUR' | 'GBP' | 'AED'`
  - `CurrencyRate`: Exchange rates relative to USD (`USD: 1.0`, `EUR: 0.92`, `GBP: 0.79`, `AED: 3.67`).
  - `CartItem`: Extends `CatalogItem` with `quantity: number`.
  - `CheckoutPayload`: `{ items: { id: string; quantity: number }[]; idempotencyKey: string }`.
- **Currency Helpers (`currency.ts`)**:
  - `formatPrice(amountInUSD: number, targetCurrency: Currency)`: Formats price into active currency format.

---

## 3. Authentication & Strict Security Domain

### 3.1 NextAuth Strict Google OAuth Integration (`app/lib/auth.ts` & `app/api/auth/[...nextauth]/route.ts`)
- **Provider**: Google OAuth (`GoogleProvider`).
- **Strict Email Authorization**:
  - Environment variable `ADMIN_ALLOWED_EMAIL` (defaulting strictly to `joisrosafer@gmail.com`).
  - In `signIn({ user })` callback: Returns `false` immediately if `user.email !== ADMIN_ALLOWED_EMAIL`, preventing unauthorized Google accounts from authenticating or creating sessions.
- **Session Strategy**: JWT strategy (`strategy: "jwt"`).
- **JWT & Session Callbacks**: Embeds admin authorization role (`role: "ADMIN"`) into session tokens.

### 3.2 Security Guards, Rate Limiting & Execution Timeouts
- **JWT Verification Helper (`getAdminSession`)**: Server-side helper verifying request headers/cookies against `NEXTAUTH_SECRET` and checking that `session.user.email === ADMIN_ALLOWED_EMAIL`.
- **Rate Limiting (`app/lib/rate-limit.ts`)**:
  - Public routes (`/api/catalog`, `/api/checkout`): Sliding-window rate limit capped at 60 req/min per IP.
  - Admin routes (`/api/admin/cars`, `/api/admin/analytics`): Sliding-window rate limit capped at 30 req/min per session.
  - Exceeding limit triggers HTTP 429 `Too Many Requests`.
- **Execution Timeouts (`app/lib/timeout.ts`)**:
  - Route segment configuration `export const maxDuration = 10;`.
  - Async database operation wrapper returning HTTP 504 Gateway Timeout if Prisma query exceeds 10 seconds.

---

## 4. API Route Architecture & REST Endpoints

### 4.1 Public Catalog Route (`app/api/catalog/route.ts`)
- **Method**: `GET`
- **Authentication**: Unauthenticated (Public).
- **Parameters**: Optional `?brand=` and `?status=` query filters.
- **Brand Filtering Normalization**:
  ```ts
  if (brandFilter && brandFilter.toLowerCase() !== "all") {
    whereClause.brand = {
      equals: brandFilter,
      mode: "insensitive"
    };
  }
  ```
- **Data Source**: Fetches hypercar items directly from PostgreSQL via Prisma, returning `stock` and full vehicle specs.

### 4.2 Stripe Checkout Sessions API (`app/api/checkout/route.ts`)
- **Method**: `POST`
- **Request Body**: `{ items: [{ id: string, quantity: number }], idempotencyKey: string }`
- **Concurrency & Stock Guard**: Atomic `prisma.$transaction` checking `stock >= quantity` prior to Stripe call. Returns HTTP 400 if stock is insufficient.
- **Idempotency Enforcement**: Passes `idempotencyKey` directly to Stripe Checkout API options (`cs_${idempotencyKey}`).
- **Order Pre-Registration**: Creates `Order` with status `"PENDING"`.

### 4.3 Stripe Webhook Handler (`app/api/webhooks/stripe/route.ts`)
- **Method**: `POST`
- **Verification**: Signature check via `stripe.webhooks.constructEvent`.
- **Events**:
  - `checkout.session.completed`: Atomic transaction updating `Order` status to `"COMPLETED"`, recording `customerEmail`, decrementing `stock`, and adjusting status to `"Unidad Final"` (stock === 1) or `"Vendido"` (stock <= 0).
  - `checkout.session.expired`: Updates `Order` status to `"EXPIRED"`.

### 4.4 Protected Admin Cars Collection Route (`app/api/admin/cars/route.ts`)
- **Methods**: `GET`, `POST`
- **Authentication**: Protected via `getAdminSession()`. Unauthenticated requests yield HTTP 401.
- **GET**: Returns full inventory list for management dashboard.
- **POST**: Validates input body (including `stock` integer) and creates a new hypercar record in PostgreSQL.

### 4.5 Protected Admin Car Item Route (`app/api/admin/cars/[id]/route.ts`)
- **Methods**: `PUT`, `DELETE`
- **Authentication**: Protected via `getAdminSession()`.
- **PUT**: Updates existing hypercar record (including `stock`) by ID.
- **DELETE**: Removes hypercar record from PostgreSQL by ID.

### 4.6 Protected Dynamic Analytics Endpoint (`app/api/admin/analytics/route.ts`)
- **Method**: `GET`
- **Authentication**: Protected via `getAdminSession()`.
- **Calculations**:
  - `totalInventoryUSD`: Aggregate sum of `(price * stock)` across all non-sold hypercars.
  - `activeUnitsCount`: Total available inventory units (`sum(stock)` where `stock > 0`).
  - `monthlyRevenueUSD`: Total `totalAmount` of `"COMPLETED"` orders in current calendar month.
  - `conversionRate`: `(completedOrdersCount / totalOrdersCount) * 100`.

---

## 5. State Management & Custom Hooks Specifications

### 5.1 `CartContext.tsx`
- Provider wrapping the application root in `app/layout.tsx`.
- Reactive state for `cart`, `currency`, `isCartOpen`, and `toastMessage`.

### 5.2 `useHypercarCart.ts`
- Encapsulates cart actions, currency conversions, drawer visibility, toast alerts, and Stripe Checkout initiation with client-side UUID idempotency key generation.

---

## 6. Component Architecture & UI Specifications

### 6.1 Catalog & Product Components (`app/components/catalog/`)
- `CatalogFilter.tsx`: Brand selection tabs normalized with `.toLowerCase()` comparison.
- `CatalogGrid.tsx`: Fetches live data from `/api/catalog`.
- `ProductCard.tsx`:
  - `stock > 1`: Emerald badge (`Stock: {stock} unidades`).
  - `stock === 1`: Amber badge (`¡Última unidad disponible!`).
  - `stock === 0`: Rose badge (`AGOTADO`) with CTA button disabled.
- `CatalogModal.tsx`: Displays stock availability in specification table and disables cart button when `stock === 0`.

### 6.2 Cart Components (`app/components/cart/`)
- `CartDrawer.tsx`: Slide-over cart displaying line items, total price, and Stripe Checkout trigger.

### 6.3 Admin Dashboard & Components (`app/components/admin/` & `app/admin/dashboard/`)
- `app/admin/dashboard/page.tsx`: Header refactored with responsive `flex-col sm:flex-row`, `shrink-0`, and `gap-4` layout to eliminate mobile text clipping and horizontal scrollbars.
- `DashboardAnalytics.tsx`: Fetches and renders live database metrics from `/api/admin/analytics`.
- `CatalogTable.tsx`: Displays `"STOCK"` column alongside price, status, and brand.
- `AdminModals.tsx`: Includes required numerical stock input `<input type="number" min="0" name="stock" />`.

---

## 7. Production Environment Configuration (`.env.example`)

```env
# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-32-character-string"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ADMIN_ALLOWED_EMAIL="joisrosafer@gmail.com"

# Stripe Payment Gateway Credentials
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
```

---

## 8. Non-Functional Constraints & Quality Standards

1. **Zero Visual/Behavioral Regression**: Maintain 100% fidelity to dark obsidian/ champagne gold design system and full-bleed video hero loop background.
2. **Type Safety & Linting**: Zero errors in `npx tsc --noEmit` and `pnpm lint`.
3. **Transaction Safety**: Atomic database transactions (`prisma.$transaction`) MUST be enforced for all checkout pre-checks and webhook stock decrements.
4. **Idempotency**: Stripe API calls MUST include `idempotencyKey` headers to guarantee zero duplicate charges or orders.
