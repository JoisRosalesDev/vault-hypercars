# OpenSpec Specification: Vault Hypercars Platform

**Version**: 3.2.0  
**Architecture Pattern**: Domain-Layered Modular Architecture & Full-Stack API Integration  
**Target Project**: Vault Hypercars (`vault-hypercars`)

---

## 1. System Overview & Architecture Guidelines

The Vault Hypercars platform is designed around a modular domain-layered architecture with full-stack Next.js App Router integrations. It separates frontend presentational concerns from persistent backend data storage, strictly typed REST API routes, Stripe payment gateway transactions, explicit stock management, real-time database analytics, enterprise security guarantees (NextAuth Google OAuth strict authorization, sliding-window rate limiting, and execution timeouts), regulatory web accessibility (WCAG 2.2 AA / Chilean Law 20.422), and comprehensive data privacy rights compliance (GDPR / Chilean Law 21.719).

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
│   │   ├── privacy/
│   │   │   └── request/
│   │   │       └── route.ts     # ARCO user rights API (data export & atomic email anonymization)
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts     # Stripe webhook endpoint (checkout.session.completed & expired)
│   │   └── admin/
│   │       ├── upload/
│   │       │   └── route.ts     # Protected car image upload endpoint (validates files, blocks ephemeral blobs)
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
│   │   │   ├── AdminModals.tsx        # Form Modal & Confirmation Dialogs with stock input field & explicit label bindings
│   │   │   ├── CatalogTable.tsx       # Live hypercar inventory table with stock column & CRUD
│   │   │   └── DashboardAnalytics.tsx # Real-time dynamic database metrics renderer
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx         # Slide-over cart drawer with Stripe Checkout trigger & accessible dialog trap
│   │   │   └── CartItemRow.tsx        # Cart item row component with quantity control & accessible labels
│   │   ├── catalog/
│   │   │   ├── CatalogFilter.tsx      # Case-normalized brand selection tabs
│   │   │   ├── CatalogGrid.tsx        # Responsive hypercar grid fetching live from /api/catalog
│   │   │   ├── CatalogModal.tsx       # Detailed specifications viewer modal with stock badge & accessible focus trap
│   │   │   └── ProductCard.tsx        # Atomic hypercar card with live stock badge & contextual CTA aria-labels
│   │   ├── layout/
│   │   │   ├── Hero.tsx               # Full-bleed video background hero banner (semantic section)
│   │   │   ├── Navbar.tsx             # Glassmorphism header with mobile drawer & semantic nav
│   │   │   └── SiteFooter.tsx         # Footer with discrete Admin link & privacy/cookie preference triggers
│   │   └── ui/
│   │       ├── CookieBanner.tsx       # GDPR & Ley 21.719 cookie consent banner (useSyncExternalStore)
│   │       ├── Icons.tsx              # Vector SVG icon library
│   │       ├── PrivacyModal.tsx       # ARCO self-service data export & erasure request dialog
│   │       ├── ThemeToggle.tsx        # Brutalist theme toggle atom (Cyan // Corsa)
│   │       └── ToastNotification.tsx  # Global feedback toast notification
│   ├── hooks/
│   │   └── useAccessibleDialog.ts     # Reusable focus trap & Escape keyboard management hook
│   └── types/
│       └── privacy.ts                 # Privacy request contracts & cookie preferences definitions
│   ├── context/
│   │   ├── CartContext.tsx            # Context provider for global cart state
│   │   └── ThemeContext.tsx           # Context provider for dynamic telemetry theme switching
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
│   ├── globals.css                    # Tailwind CSS v4 styling rules & telemetry variables
│   ├── layout.tsx                     # Root layout with ThemeProvider, fonts & CartProvider
│   └── page.tsx                       # Customer landing page composing layout & catalog components
├── tailwind.config.ts                 # Tailwind configuration with telemetry & accent extensions
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
  - `Currency`: `'USD' | 'EUR' | 'CLP'`
  - `CurrencyRate`: Exchange rates relative to USD (`USD: 1.0`, `EUR: 0.92`, `CLP: 950` with symbol `'CLP $'`).
  - `CartItem`: Extends `CatalogItem` with `quantity: number`.
  - `CheckoutPayload`: `{ items: { id: string; quantity: number }[]; idempotencyKey: string }`.
- **Currency Helpers (`currency.ts`)**:
  - `formatPrice(amountInUSD: number, targetCurrency: Currency)`: Formats price into active currency format (integer precision without decimal cents for CLP).

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

### 3.3 Media Persistence & Asset Upload Security (`app/api/admin/upload/route.ts`)
- **Admin Verification**: Only authenticated admin sessions can upload assets via NextAuth validation.
- **MIME & Size Enforcement**: Rejects non-image files and enforces maximum upload size limits.
- **Persistence Guarantee**: Replaces ephemeral client-side `blob:` URLs with persistent file paths under `public/uploads`, preventing database corruption upon tab destruction.
- **Sanitized Auth Error States**: `app/admin/login/page.tsx` renders generic authentication failure messages without exposing administrator emails.

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

## 6. Component Architecture & UI Specifications (Telemetry Brutalism)

### 6.1 Theme System & Styling Foundations (`app/context/ThemeContext.tsx`, `app/globals.css`, `tailwind.config.ts`)
- **Dynamic Dual Theme**:
  - `cyan` (Cyan Eléctrico, `#06b6d4`, default state).
  - `corsa` (Rojo Corsa, `#ef4444`).
- **Typography Foundations**:
  - Display: `Space Grotesk` (`font-display font-black tracking-tight`).
  - Metrics / Telemetry: `JetBrains Mono` (`font-mono tabular-nums`).
- **Theme Switcher (`ThemeToggle.tsx`)**:
  - Direct DOM mutation on `document.documentElement.setAttribute("data-theme", theme)` with `localStorage` persistence and anti-flicker inline script in `app/layout.tsx`.
- **Chasis & Geometry**:
  - Sharp corners (`rounded-none sm:rounded-sm`), dark carbon panels (`bg-zinc-950`, `bg-zinc-900/50`), technical dividers (`border-zinc-800`), and telemetry glows (`shadow-[0_0_15px_var(--color-accent-glow)]`).

### 6.2 Catalog & Product Components (`app/components/catalog/`)
- `CatalogFilter.tsx`: Case-normalized brand selection tabs with sharp rectangular geometry and dynamic accent highlight.
- `CatalogGrid.tsx`: Fetches live data from `/api/catalog`.
- `ProductCard.tsx`:
  - Contained in brutalist glassmorphism chasis (`bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-none sm:rounded-sm`).
  - Technical metrics in `font-mono tabular-nums`.
  - Stock badges:
    - `stock > 1`: Emerald badge (`Stock: {stock} u.`).
    - `stock === 1`: Accent badge (`¡Última unidad!`).
    - `stock === 0`: Rose badge (`AGOTADO`) with CTA button disabled.
  - Inspection button with accessible `aria-label="Ver detalles"`.
- `CatalogModal.tsx`: Displays technical specifications with `font-mono tabular-nums` and CTA button in `bg-accent`.

### 6.3 Cart Components (`app/components/cart/`)
- `CartDrawer.tsx`: Slide-over cart displaying line items, multi-currency selector, total in `font-mono text-accent`, and Stripe Checkout trigger.
- `CartItemRow.tsx`: Technical cart item card with monospace controls.

### 6.4 Admin Dashboard & Components (`app/components/admin/` & `app/admin/dashboard/`)
- `app/admin/login/page.tsx`: Glassmorphism login card on `bg-zinc-950` with strict Google OAuth authorization.
- `app/admin/dashboard/page.tsx`: Responsive telemetry header, real-time KPI overview, and catalog inventory table.
- `DashboardAnalytics.tsx`: Fetches and renders live database metrics in telemetry HUD cards (`font-mono tabular-nums text-accent`).
- `CatalogTable.tsx`: Displays inventory with monospace metrics, status indicators, and actions.
- `AdminModals.tsx`: Brutalist form modal and double confirmation dialog with numerical stock input `<input type="number" min="0" name="stock" />` and explicit `<label htmlFor={id}>` / `<input id={id}>` bindings.

### 6.5 Web Compliance, Accessibility & Data Privacy Components
- `CookieBanner.tsx`: GDPR & Ley 21.719 cookie consent banner providing equal prominence "Aceptar Todo" / "Rechazar No Esenciales" actions, zero pre-checked options, and reactive hydration via `useSyncExternalStore`.
- `PrivacyModal.tsx`: Self-service ARCO modal allowing users to download their personal order data as sanitized JSON or exercise their right to erasure.
- `useAccessibleDialog.ts`: Native React hook managing modal focus trapping (`Tab` / `Shift+Tab`), `Escape` key dismissal, and restoring focus to trigger buttons without external UI runtime bloat. Pauses parent dialog focus trap when nested confirmation modal is open (`isOpen && !childModalOpen`).
- `Hero.tsx`: High-impact video loop with programmatic pause on `(prefers-reduced-motion: reduce)` preserving frame visibility without black screen void, calibrated 55% opacity, and softened gradient overlay for WCAG AAA text contrast.
- `POST /api/privacy/request`: Privacy handler supporting data export and atomic email anonymization (`anonymized_<UUID>@vault.invalid`) preserving statutory fiscal transaction history.

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

1. **Telemetry Brutalist Visual Language**: 100% adherence to Carbon Gray/Titanium White/Dynamic Accent (Cyan/Corsa) design system with monospaced telemetry metrics and zero gold remnants.
2. **Backend & Data Immutability**: Strict zero-mutation policy for `prisma/schema.prisma` and server endpoints `app/api/` (except authorized compliance endpoints).
3. **Type Safety & Linting**: Zero errors in `npx tsc --noEmit` and `pnpm lint`.
4. **Transaction Safety**: Atomic database transactions (`prisma.$transaction`) MUST be enforced for all checkout pre-checks and webhook stock decrements.
5. **Idempotency**: Stripe API calls MUST include `idempotencyKey` headers to guarantee zero duplicate charges or orders.
6. **Web Accessibility (WCAG 2.2 AA / Chilean Law 20.422)**: Color contrast ratio >= 4.5:1 across all themes (Corsa accent contrast at 6.76:1), native accessible dialog focus trapping, `<main id="main-content">` landmark, and explicit programmatic label association.
7. **Data Privacy & User Rights (GDPR / Chilean Law 21.719)**: Symmetric consent management without dark patterns or pre-checked checkboxes, rate-limited privacy endpoints, anti-enumeration protections, and atomic irreversible anonymization preserving accounting records.
