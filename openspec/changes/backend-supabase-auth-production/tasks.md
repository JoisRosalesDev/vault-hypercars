# OpenSpec Tasks: Backend Supabase & Strict Google OAuth Production Integration

**Change ID**: `backend-supabase-auth-production`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  
**Status**: Proposed / Pending Implementation  

---

## Task Overview

This document defines the sequential, verifiable task phases for implementing the persistent Supabase PostgreSQL database, strict Google OAuth authentication (restricted to `joisrosafer@gmail.com`), REST API routes, security resilience helpers (rate limiting and execution timeouts), and frontend live data integration for the Vault Hypercars platform.

---

## Phase 1: Database Setup & Prisma ORM Foundation

- [x] **Task 1.1: Install Database & Authentication Dependencies**
  - Update `package.json` with `@prisma/client` and `next-auth` as production dependencies, and `prisma` as a development dependency.
  - Run package installation command (`pnpm install` / `npm install`).
  - *Verification*: Confirm `package.json` contains dependencies and `node_modules` updates without errors.

- [x] **Task 1.2: Define Prisma Database Schema**
  - Create `prisma/schema.prisma` configured for PostgreSQL with `DATABASE_URL` (pgBouncer transaction pooler) and `DIRECT_URL` (direct migration connection).
  - Define `Hypercar` inventory model (`id`, `name`, `brand`, `year`, `price`, `hp`, `topSpeed`, `acceleration`, `engine`, `status`, `image`, `description`, `createdAt`, `updatedAt`) with indices on `brand` and `status`.
  - Define NextAuth security models: `Account`, `Session`, `User`, and `VerificationToken`.
  - *Verification*: Run `npx prisma validate` to confirm schema validity.

- [x] **Task 1.3: Implement Singleton Prisma Client**
  - Create `app/lib/prisma.ts`.
  - Export global `prisma` client instance stored on `globalThis.prisma` to prevent connection leaks during Next.js Hot Module Replacement (HMR).
  - Configure query logging for development mode and error-only logging for production.
  - *Verification*: Run `npx tsc --noEmit` to verify type safety of `app/lib/prisma.ts`.

- [x] **Task 1.4: Implement Initial Data Seeding Script**
  - Create `prisma/seed.ts`.
  - Write script populating initial hypercar catalog records (Bugatti Tourbillon, Chiron Pur Sport, Divo; Lamborghini Revuelto, Sian FKP 37, Veneno; Ferrari SF90 XX Stradale, Daytona SP3, LaFerrari) into Supabase PostgreSQL.
  - Configure `prisma.seed` script execution command in `package.json`.
  - *Verification*: Run `npx tsc --noEmit` to ensure seed script compiles without errors.

---

## Phase 2: NextAuth & Strict Google OAuth Integration

- [x] **Task 2.1: Create Security & Auth Configuration Module**
  - Create `app/lib/auth.ts`.
  - Configure `authOptions` with `GoogleProvider` using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - Define `ALLOWED_ADMIN_EMAIL` constant sourced from `process.env.ADMIN_ALLOWED_EMAIL` (defaulting strictly to `joisrosafer@gmail.com`).
  - Implement `signIn` callback returning `false` immediately for any email that does not match `ALLOWED_ADMIN_EMAIL` to block unauthorized OAuth sign-ins.
  - Implement `jwt` and `session` callbacks attaching role `"ADMIN"` and verified email to sessions.
  - Export `getAdminSession()` server-side helper to verify incoming request authorization.
  - *Verification*: Run `npx tsc --noEmit` to confirm strict typing and exports of `app/lib/auth.ts`.

- [x] **Task 2.2: Implement NextAuth App Router API Handler**
  - Create `app/api/auth/[...nextauth]/route.ts`.
  - Export GET and POST HTTP handlers wrapping NextAuth with `authOptions`.
  - *Verification*: Run `npx tsc --noEmit` to verify route handler export signatures.

- [x] **Task 2.3: Update Admin Login UI for Google OAuth**
  - Refactor `app/admin/login/page.tsx` to replace simulated input fields with Google OAuth sign-in trigger (`signIn("google", { callbackUrl: "/admin/dashboard" })`).
  - Style sign-in button using dark obsidian and champagne gold design tokens (`#D4AF37`).
  - Add query parameter check to display warning alerts when redirected with `?error=AccessDenied`.
  - *Verification*: Run `npx tsc --noEmit` to verify UI component compilation.

---

## Phase 3: Security Resilience, Rate Limiting & Execution Timeouts

- [x] **Task 3.1: Implement IP/Session Rate Limiting Guard**
  - Create `app/lib/rate-limit.ts`.
  - Implement sliding-window rate limiter utilizing in-memory Map inspecting client IP address (`x-forwarded-for`, `x-real-ip`).
  - Export `checkRateLimit(req, options)` returning HTTP 429 `Too Many Requests` response with `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers when threshold is exceeded.
  - Include periodic 5-minute cleanup interval for expired rate limit tracking records.
  - *Verification*: Run `npx tsc --noEmit` to ensure clean helper exports.

- [x] **Task 3.2: Implement Route Execution Timeout Guard**
  - Create `app/lib/timeout.ts`.
  - Define custom `TimeoutError` class (extending `Error`) with HTTP status 504.
  - Export `withTimeout<T>(promise, ms = 9000, customErrorMsg)` helper racing async operations against a timeout promise.
  - *Verification*: Run `npx tsc --noEmit` to confirm `withTimeout` typing.

---

## Phase 4: Production REST API Endpoints Implementation

- [x] **Task 4.1: Implement Public Catalog API Route**
  - Create `app/api/catalog/route.ts`.
  - Export `maxDuration = 10;`.
  - Implement `GET` handler:
    - Apply public rate limiting (60 req/min/IP via `checkRateLimit`).
    - Parse optional `brand` and `status` query parameters from `req.url`.
    - Execute `prisma.hypercar.findMany` wrapped with `withTimeout`.
    - Return JSON hypercar collection with HTTP status 200.
  - *Verification*: Run `npx tsc --noEmit` to confirm route handler logic.

- [x] **Task 4.2: Implement Protected Admin Cars Collection Route**
  - Create `app/api/admin/cars/route.ts`.
  - Export `maxDuration = 10;`.
  - Implement `GET` handler:
    - Verify admin session via `getAdminSession()`; return HTTP 401 if unauthenticated.
    - Apply admin rate limiting (30 req/min/session).
    - Query and return all hypercars from PostgreSQL via Prisma wrapped with `withTimeout`.
  - Implement `POST` handler:
    - Verify admin session via `getAdminSession()`; return HTTP 401 if unauthenticated.
    - Apply admin rate limiting (30 req/min/session).
    - Validate required payload fields (`name`, `brand`, `year`, `price`, `hp`, `topSpeed`, `status`, `image`).
    - Create new hypercar record in PostgreSQL via `prisma.hypercar.create` wrapped with `withTimeout`.
    - Return created hypercar with HTTP status 201.
  - *Verification*: Run `npx tsc --noEmit`.

- [x] **Task 4.3: Implement Protected Admin Car Item Route**
  - Create `app/api/admin/cars/[id]/route.ts`.
  - Export `maxDuration = 10;`.
  - Implement `PUT` handler:
    - Verify admin session via `getAdminSession()`; return HTTP 401 if unauthenticated.
    - Apply admin rate limiting (30 req/min/session).
    - Update specified hypercar by `id` in PostgreSQL via `prisma.hypercar.update` wrapped with `withTimeout`.
    - Return updated hypercar with HTTP status 200.
  - Implement `DELETE` handler:
    - Verify admin session via `getAdminSession()`; return HTTP 401 if unauthenticated.
    - Apply admin rate limiting (30 req/min/session).
    - Remove hypercar record by `id` from PostgreSQL via `prisma.hypercar.delete` wrapped with `withTimeout`.
    - Return HTTP 200 JSON success response.
  - *Verification*: Run `npx tsc --noEmit`.

---

## Phase 5: Frontend Live API Integration & Data Purge

- [x] **Task 5.1: Wire Customer Catalog Grid to Live API**
  - Refactor `app/components/catalog/CatalogGrid.tsx` to fetch hypercar inventory from `/api/catalog` with support for `brand` filtering.
  - Add client-side loading indicators (skeleton/spinner) and error handling state.
  - *Verification*: Run `npx tsc --noEmit` and check component prop types.

- [x] **Task 5.2: Wire Admin Dashboard & Components to Live API**
  - Refactor `app/admin/dashboard/page.tsx` to fetch inventory from `GET /api/admin/cars`.
  - Refactor `CatalogTable.tsx` and `AdminModals.tsx` to dispatch `POST`, `PUT`, and `DELETE` requests directly to `/api/admin/cars` and `/api/admin/cars/[id]`.
  - Automatically handle HTTP 401/403 responses by redirecting unauthenticated requests to `/admin/login`.
  - *Verification*: Run `npx tsc --noEmit`.

- [x] **Task 5.3: Deprecate In-Memory Catalog Imports**
  - Remove imports of `initialCatalogItems` from `app/data/initialCatalog.ts` across runtime components.
  - Ensure zero components depend on local in-memory mock datasets for catalog rendering.
  - *Verification*: Run `npx tsc --noEmit` to ensure no broken references remain.

---

## Phase 6: Environment Template & Quality Assurance Verification

- [x] **Task 6.1: Define Production Environment Reference File**
  - Create `.env.example` at the repository root.
  - Document `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `ADMIN_ALLOWED_EMAIL="joisrosafer@gmail.com"`.
  - *Verification*: Verify `.env.example` covers all environment variables required by `prisma.ts`, `auth.ts`, and Next.js backend.

- [x] **Task 6.2: Validate Prisma Schema Integrity**
  - Run `npx prisma validate`.
  - *Verification*: Output reports valid schema with zero syntax or relation errors.

- [x] **Task 6.3: Strict TypeScript Compilation Check**
  - Run `npx tsc --noEmit`.
  - *Verification*: TypeScript compiler completes with exit code 0 and zero errors.

- [x] **Task 6.4: ESLint Code Quality Verification**
  - Run `pnpm lint` (or `npm run lint`).
  - Resolve any linting warnings or errors.
  - *Verification*: Linter completes cleanly with zero errors.
