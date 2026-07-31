# OpenSpec Specification: Vault Hypercars Platform

**Version**: 3.0.0  
**Architecture Pattern**: Domain-Layered Modular Architecture & Full-Stack API Integration  
**Target Project**: Vault Hypercars (`vault-hypercars`)

---

## 1. System Overview & Architecture Guidelines

The Vault Hypercars platform is designed around a modular domain-layered architecture with full-stack Next.js App Router integrations. It separates frontend presentational concerns from persistent backend data storage, strictly typed REST API routes, and enterprise security guarantees (NextAuth Google OAuth strict authorization, sliding-window rate limiting, and execution timeouts).

```
vault-hypercars/
├── prisma/
│   ├── schema.prisma            # Prisma PostgreSQL schema (Hypercar, User, Account, Session, VerificationToken)
│   └── seed.ts                  # Production dataset seeding script
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth handler with strict Google OAuth callback
│   │   ├── catalog/
│   │   │   └── route.ts         # Public GET catalog API endpoint
│   │   └── admin/
│   │       └── cars/
│   │           ├── route.ts     # Protected GET & POST hypercar endpoint
│   │           └── [id]/
│   │               └── route.ts # Protected PUT & DELETE hypercar endpoint
│   ├── admin/
│   │   ├── dashboard/page.tsx   # Admin dashboard connected to live /api/admin/cars
│   │   └── login/page.tsx       # Google OAuth Admin Login page component
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminModals.tsx        # Form Modal & Confirmation Dialogs connected to live API
│   │   │   ├── CatalogTable.tsx       # Live hypercar inventory table with CRUD triggers
│   │   │   └── DashboardAnalytics.tsx # Live inventory metrics & financial analytics
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx         # Slide-over cart drawer with checkout
│   │   │   └── CartItemRow.tsx        # Cart item row component with quantity control
│   │   ├── catalog/
   │   │   ├── CatalogFilter.tsx      # Brand selection filter (Bugatti, Lamborghini, Ferrari, All)
   │   │   ├── CatalogGrid.tsx        # Responsive hypercar grid fetching live from /api/catalog
   │   │   ├── CatalogModal.tsx       # Detailed specifications viewer modal
   │   │   └── ProductCard.tsx        # Atomic hypercar card component
   │   ├── layout/
   │   │   ├── Hero.tsx               # Full-bleed video background hero banner
   │   │   ├── Navbar.tsx             # Glassmorphism header with mobile drawer
   │   │   └── SiteFooter.tsx         # Footer with discrete Admin link
   │   └── ui/
   │       ├── Icons.tsx              # Vector SVG icon library
   │       └── ToastNotification.tsx  # Global feedback toast notification
   ├── context/
   │   └── CartContext.tsx            # Context provider for global cart state
   ├── hooks/
   │   └── useHypercarCart.ts         # Custom hook encapsulating cart actions & currency logic
   ├── lib/
   │   ├── auth.ts                    # NextAuth options & admin session helper (getAdminSession)
   │   ├── currency.ts                # Multi-currency rates & price formatting helpers
   │   ├── prisma.ts                  # Singleton Prisma Client instance
   │   ├── rate-limit.ts              # Sliding-window IP/session rate limiter guard
   │   └── timeout.ts                 # Route execution timeout wrapper (10s max duration)
   ├── types/
   │   ├── admin.ts                   # Admin dashboard & modal form type definitions
   │   ├── cart.ts                    # Cart state, items & currency type definitions
   │   └── catalog.ts                 # Catalog item, brand & status type definitions
   ├── globals.css                    # Tailwind CSS v4 styling rules
   ├── layout.tsx                     # Root layout with CartProvider wrapper
   └── page.tsx                       # Customer landing page composing layout & catalog components
├── .env.example                     # Production environment variable reference template
└── openspec/                         # SDD specifications & change tracking
```

---

## 2. Domain & Persistence Specifications

### 2.1 Prisma PostgreSQL Schema (`prisma/schema.prisma` & `app/lib/prisma.ts`)
- **Database Provider**: PostgreSQL (Supabase with `DATABASE_URL` pooling & `DIRECT_URL` migration connection).
- **Models**:
  - `Hypercar`: Primary vehicle inventory record (`id`, `name`, `brand`, `year`, `price`, `hp`, `topSpeed`, `acceleration`, `engine`, `status`, `image`, `description`, `createdAt`, `updatedAt`).
  - `User`, `Account`, `Session`, `VerificationToken`: NextAuth standard authentication & user session models.
- **Singleton Client**: Global `prisma` client instance stored on `globalThis` to prevent connection leaks during Next.js hot module reloads.

### 2.2 Catalog Domain (`app/types/catalog.ts`)
- **Types**:
  - `Brand`: `'Bugatti' | 'Lamborghini' | 'Ferrari' | 'All'`
  - `ItemStatus`: `'Disponible' | 'Reservado' | 'Vendido'`
  - `HypercarSpecs`: Object specifying performance details (`hp`, `topSpeed`, `acceleration`, `engine`).
  - `CatalogItem`: Interface matching the database payload schema.

### 2.3 Cart & Currency Domain (`app/types/cart.ts` & `app/lib/currency.ts`)
- **Types**:
  - `Currency`: `'USD' | 'EUR' | 'GBP' | 'AED'`
  - `CurrencyRate`: Exchange rates relative to USD (`USD: 1.0`, `EUR: 0.92`, `GBP: 0.79`, `AED: 3.67`).
  - `CartItem`: Extends `CatalogItem` with `quantity: number`.
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
  - Public routes (`/api/catalog`): Sliding-window rate limit capped at 60 req/min per IP.
  - Admin routes (`/api/admin/cars`): Sliding-window rate limit capped at 30 req/min per session.
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
- **Data Source**: Fetches hypercar items directly from PostgreSQL via Prisma.

### 4.2 Protected Admin Cars Collection Route (`app/api/admin/cars/route.ts`)
- **Methods**: `GET`, `POST`
- **Authentication**: Protected via `getAdminSession()`. Unauthenticated requests yield HTTP 401.
- **GET**: Returns full inventory list for management dashboard.
- **POST**: Validates input body and creates a new hypercar record in PostgreSQL.

### 4.3 Protected Admin Car Item Route (`app/api/admin/cars/[id]/route.ts`)
- **Methods**: `PUT`, `DELETE`
- **Authentication**: Protected via `getAdminSession()`.
- **PUT**: Updates existing hypercar record by ID.
- **DELETE**: Removes hypercar record from PostgreSQL by ID.

---

## 5. State Management & Custom Hooks Specifications

### 5.1 `CartContext.tsx`
- Provider wrapping the application root in `app/layout.tsx`.
- Reactive state for `cart`, `currency`, `isCartOpen`, and `toastMessage`.

### 5.2 `useHypercarCart.ts`
- Encapsulates cart actions, currency conversions, drawer visibility, and toast alerts.

---

## 6. Component Architecture & Modular Specifications

### 6.1 Layout Components (`app/components/layout/`)
- `Navbar.tsx`, `Hero.tsx`, `SiteFooter.tsx`.

### 6.2 Catalog Components (`app/components/catalog/`)
- `CatalogFilter.tsx`, `CatalogGrid.tsx` (fetches live data from `/api/catalog`), `ProductCard.tsx`, `CatalogModal.tsx`.

### 6.3 Cart Components (`app/components/cart/`)
- `CartDrawer.tsx`, `CartItemRow.tsx`.

### 6.4 Admin Components (`app/components/admin/`)
- `DashboardAnalytics.tsx`, `CatalogTable.tsx` (connected to `/api/admin/cars`), `AdminModals.tsx` (mutates live data via `/api/admin/cars`).

### 6.5 UI Shared Components (`app/components/ui/`)
- `Icons.tsx` (Vector SVG library), `ToastNotification.tsx`.

---

## 7. Production Environment Configuration (`.env.example`)

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-32-character-string"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ADMIN_ALLOWED_EMAIL="joisrosafer@gmail.com"
```

---

## 8. Non-Functional Constraints & Quality Standards

1. **Zero Visual/Behavioral Regression**: 100% fidelity to dark obsidian/ champagne gold design system and video loop hero background.
2. **Type Safety & Linting**: Zero errors in `npx tsc --noEmit` and `pnpm lint`.
3. **Security Standards**: Server secrets must never be exposed to the client bundle. Strictly enforce `joisrosafer@gmail.com` as the sole authorized admin email.
