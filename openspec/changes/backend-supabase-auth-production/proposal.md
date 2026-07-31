# OpenSpec Proposal: Backend Supabase & Strict Google OAuth Production Integration

**Change ID**: `backend-supabase-auth-production`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  

---

## 1. Overview & Change Intent

The Vault Hypercars platform currently relies on local in-memory catalog data (`initialCatalog.ts`) and simulated admin authentication (`/admin/login`). To transition the platform into a production-ready enterprise application, this proposal outlines the complete backend architecture overhaul:

1. **Database Persistence**: Integrate PostgreSQL hosted on Supabase utilizing Prisma ORM (`prisma`, `@prisma/client`) for data modeling, migrations, and type-safe database queries.
2. **Strict Identity & Access Management (IAM)**: Implement Google OAuth authentication via NextAuth / Auth.js, strictly restricted to `joisrosafer@gmail.com`. Any unauthorized Google login attempts will be immediately rejected at the OAuth callback level.
3. **Real Data API Routes**: Purge mock/dummy datasets from frontend runtime state and connect Next.js API endpoints (`/api/catalog`, `/api/admin/cars`) directly to the Supabase PostgreSQL database.
4. **Production Security & Resilience**: Enforce JWT session verification for admin routes, implement request rate-limiting, impose route execution timeouts, and maintain absolute environment variable hygiene (preventing backend secret leaks).
5. **Environment Standardization**: Define `.env.example` containing all essential production configurations.

---

## 2. Technical Architecture & Component Tree

```
vault-hypercars/
├── prisma/
│   ├── schema.prisma            # Prisma schema (Hypercar, Account, Session, User, VerificationToken)
│   └── seed.ts                  # Production initial seeding script
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth / Auth.js handler with strict Google OAuth callback
│   │   ├── catalog/
│   │   │   └── route.ts         # Public GET catalog API (with search & brand filter)
│   │   └── admin/
│   │       └── cars/
│   │           ├── route.ts     # Protected GET (admin list) & POST (create hypercar)
│   │           └── [id]/
│   │               └── route.ts # Protected PUT (update hypercar) & DELETE (delete hypercar)
│   ├── lib/
│   │   ├── prisma.ts            # Singleton Prisma Client instance with log management
│   │   ├── auth.ts              # NextAuth options & server session helper (`getAdminSession`)
│   │   ├── rate-limit.ts        # Sliding-window / token-bucket rate limiter guard helper
│   │   └── timeout.ts           # Route execution timeout wrapper (10s max duration)
│   ├── admin/
│   │   ├── login/page.tsx       # Updated Login Page with Google OAuth Sign-in trigger
│   │   └── dashboard/page.tsx   # Dashboard connected to real /api/admin/cars API
│   └── components/
│       ├── catalog/             # Components updated to fetch live data from /api/catalog
│       └── admin/               # Admin components updated for live API CRUD calls
├── .env.example                 # Production environment variable reference template
└── openspec/
    └── changes/
        └── backend-supabase-auth-production/
            └── proposal.md      # This proposal specification document
```

---

## 3. Detailed Technical Specifications

### 3.1 Database & Prisma ORM Schema (`prisma/schema.prisma` & `app/lib/prisma.ts`)

#### Prisma Schema Specifications
- **Provider**: `postgresql` with Supabase pooling (`DATABASE_URL`) and direct migration URL (`DIRECT_URL`).
- **Data Models**:
  - `Hypercar`: Primary inventory table:
    - `id` (String, `@id @default(cuid())`)
    - `name` (String)
    - `brand` (String) — *Bugatti, Lamborghini, Ferrari*
    - `year` (Int)
    - `price` (Float / Decimal) — *Base USD numeric price*
    - `hp` (Int)
    - `topSpeed` (String)
    - `acceleration` (String)
    - `engine` (String)
    - `status` (String) — *Disponible, Reservado, Vendido*
    - `image` (String) — *URL or stored media path*
    - `description` (Text)
    - `createdAt` (DateTime `@default(now())`)
    - `updatedAt` (DateTime `@updatedAt`)
  - **Auth Models** (NextAuth standard models): `User`, `Account`, `Session`, `VerificationToken`.

#### Singleton Prisma Client (`app/lib/prisma.ts`)
- Prevents connection leak in Next.js development hot-reloading by attaching the `PrismaClient` instance to `globalThis.prisma`.

---

### 3.2 Authentication & Strict Authorization (`app/lib/auth.ts` & `app/api/auth/[...nextauth]/route.ts`)

#### NextAuth / Auth.js Configuration
- **Provider**: Google OAuth (`GoogleProvider`).
- **Allowed Admin Email**: Strictly defined via environment variable `ADMIN_ALLOWED_EMAIL` (defaulting strictly to `joisrosafer@gmail.com`).
- **SignIn Callback Guard**:
  ```ts
  async signIn({ user }) {
    const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL || "joisrosafer@gmail.com";
    if (user.email !== allowedEmail) {
      return false; // Reject authentication attempt immediately
    }
    return true;
  }
  ```
- **Session Strategy**: JWT (`strategy: "jwt"`).
- **Custom JWT Callback**: Encodes user email and authorization role (`role: "ADMIN"`).
- **Session Callback**: Passes authorization status to `session.user`.

#### Login UI (`app/admin/login/page.tsx`)
- Refactored to replace dummy form inputs with NextAuth `signIn("google")` button with gold-accent styling matching Vault Hypercars aesthetics.

---

### 3.3 API Route Architecture & Real Data Wiring

#### Public Catalog Route (`app/api/catalog/route.ts`)
- **Method**: `GET`
- **Behavior**: Retrieves active catalog items from PostgreSQL via Prisma. Supports optional query parameters `?brand=Bugatti` and `?status=Disponible`.
- **Response**: JSON array of hypercars.

#### Protected Admin Cars Collection Route (`app/api/admin/cars/route.ts`)
- **Methods**: `GET`, `POST`
- **Security**: Requires active JWT session verified via `getAdminSession()`. If unauthenticated or user email is not `joisrosafer@gmail.com`, returns HTTP 401 Unauthorized / HTTP 403 Forbidden.
- **POST Payload**: Validated hypercar creation data (Name, Brand, Year, Price, HP, TopSpeed, Acceleration, Engine, Status, Image, Description).

#### Protected Admin Car Item Route (`app/api/admin/cars/[id]/route.ts`)
- **Methods**: `PUT`, `DELETE`
- **Security**: Requires active admin JWT session.
- **PUT Payload**: Partial or full hypercar update payload.
- **DELETE Behavior**: Permanently removes specified hypercar record from Supabase PostgreSQL database.

---

### 3.4 Security, Rate Limiting & Resilience Measures

1. **JWT Verification**:
   - Centralized helper `requireAdminSession(req)` that validates the NextAuth token against secret `NEXTAUTH_SECRET` and verifies `session.user.email === "joisrosafer@gmail.com"`.
2. **API Route Rate Limiting (`app/lib/rate-limit.ts`)**:
   - Implement rate limiter (in-memory token bucket / sliding window IP checking) restricting requests:
     - Public routes (`/api/catalog`): max 60 requests per minute per IP.
     - Protected Admin routes (`/api/admin/cars`): max 30 requests per minute per authenticated session.
   - Exceeding limit returns `HTTP 429 Too Many Requests`.
3. **Execution Timeouts (`app/lib/timeout.ts`)**:
   - Export Next.js segment config `export const maxDuration = 10;` (10 seconds timeout limit) and wrap Prisma async operations with `Promise.race` timeout handlers to prevent hanging connections.
4. **Secret Key Hygiene**:
   - Strictly prohibit exposing `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, or `ADMIN_ALLOWED_EMAIL` to client components.
   - Only `NEXT_PUBLIC_` prefixed variables (if required for client analytics/base URLs) are bundled into the browser build.

---

## 4. Production Environment Configuration (`.env.example`)

The following `.env.example` template will be created at the project root:

```env
# ==========================================
# VAULT HYPERCARS - PRODUCTION ENVIRONMENT VARIABLES
# ==========================================

# Database Connection (Supabase PostgreSQL)
# Connection pooler URL (pgBouncer / Transaction mode)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct database connection URL (Used for Prisma migrations & CLI commands)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres"

# NextAuth / Auth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-32-character-string"

# Google OAuth Credentials (Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Strict Admin Authorization Rule
ADMIN_ALLOWED_EMAIL="joisrosafer@gmail.com"
```

---

## 5. Impact & Refactoring Strategy

### Frontend Refactoring
- **`CatalogGrid.tsx` & Landing Page**: Replace reference to static `initialCatalogItems` with client/server fetch from `/api/catalog`.
- **`CartContext.tsx`**: Maintain cart state client-side while verifying hypercar prices/availability against real database items.
- **Admin Dashboard (`app/admin/dashboard/page.tsx`)**: Refactor `CatalogTable` and `AdminModals` to dispatch fetch, POST, PUT, and DELETE operations to `/api/admin/cars`.

### Dependency Changes
Add the following dependencies to `package.json`:
- Dependencies: `@prisma/client`, `next-auth`
- DevDependencies: `prisma`

---

## 6. Verification & Quality Assurance Plan

1. **Schema & Migration Verification**:
   - Run `npx prisma validate` to confirm schema integrity.
   - Run `npx tsc --noEmit` to verify strict TypeScript compilation.
2. **Authentication Verification**:
   - Attempt login with `joisrosafer@gmail.com` -> Authentication succeeds and redirects to `/admin/dashboard`.
   - Attempt login with any other Google account (e.g. `unauthorized@example.com`) -> Authentication is blocked with AccessDenied error.
3. **API & Security Testing**:
   - Unauthenticated request to `/api/admin/cars` returns HTTP 401.
   - Rapid API requests trigger HTTP 429 Rate Limit error.
   - Public GET `/api/catalog` returns real DB records without requiring authentication headers.
4. **Code Quality**:
   - Run `pnpm lint` to ensure zero ESLint warnings or errors.

---

## 7. Task Breakdown & Implementation Checklist

- [ ] **Phase 1: Database & Prisma Setup**
  - Install `@prisma/client` and `prisma` CLI.
  - Create `prisma/schema.prisma` with `Hypercar`, `User`, `Account`, `Session` models.
  - Create `app/lib/prisma.ts` singleton client.
  - Create `prisma/seed.ts` for populating initial production dataset.

- [ ] **Phase 2: NextAuth & Strict Google OAuth Integration**
  - Install `next-auth`.
  - Create `app/api/auth/[...nextauth]/route.ts` and `app/lib/auth.ts`.
  - Implement strict email guard (`joisrosafer@gmail.com`) in NextAuth `signIn` callback.
  - Update `app/admin/login/page.tsx` with Google OAuth login trigger.

- [ ] **Phase 3: Real Data API Routes Implementation**
  - Implement public GET `/api/catalog/route.ts` connected to Prisma.
  - Implement protected `/api/admin/cars/route.ts` (GET, POST).
  - Implement protected `/api/admin/cars/[id]/route.ts` (PUT, DELETE).

- [ ] **Phase 4: Security, Rate Limiting & Execution Timeouts**
  - Create `app/lib/rate-limit.ts` for API route rate limiting.
  - Create `app/lib/timeout.ts` execution timeout wrappers.
  - Apply JWT verification middleware/helpers across all admin API routes.

- [ ] **Phase 5: Frontend API Integration & Data Purge**
  - Update `CatalogGrid` and landing page components to fetch live data from `/api/catalog`.
  - Update `CatalogTable` and `AdminModals` to mutate live data via `/api/admin/cars`.
  - Remove runtime dependence on static `initialCatalog.ts`.

- [ ] **Phase 6: Environment Template & Final QA Verification**
  - Write `.env.example`.
  - Run type checking (`npx tsc --noEmit`) and linting (`pnpm lint`).
