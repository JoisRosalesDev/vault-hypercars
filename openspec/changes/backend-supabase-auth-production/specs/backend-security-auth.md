# Delta Specification: Backend Supabase & Strict Google OAuth Production Integration

**Change ID**: `backend-supabase-auth-production`  
**Target Specification**: `openspec/specs/vault-hypercars/spec.md`  
**Mode**: `hybrid`

---

## 1. Summary of Changes

This delta spec defines the production backend architecture for Vault Hypercars, transitioning from local static in-memory catalog data and mock admin login to a Supabase-backed PostgreSQL persistence layer, NextAuth Google OAuth authentication with strict email authorization (`joisrosafer@gmail.com`), type-safe REST API endpoints, and production-grade security, rate-limiting, and timeout protections.

---

## 2. Technical Specifications & Requirements

### 2.1 Prisma PostgreSQL Schema Requirements (`prisma/schema.prisma` & `app/lib/prisma.ts`)

1. **Database Provider & Connectivity**:
   - Provider: `postgresql`.
   - `DATABASE_URL`: Connection string targeting Supabase pgBouncer pooler (transaction mode) for serverless API handlers.
   - `DIRECT_URL`: Direct PostgreSQL connection string for Prisma CLI operations and schema migrations.

2. **Data Models**:
   - **`Hypercar` Model**:
     - `id`: String (`@id @default(cuid())`)
     - `name`: String
     - `brand`: String (e.g., `'Bugatti'`, `'Lamborghini'`, `'Ferrari'`)
     - `year`: Int
     - `price`: Float (Base price in USD)
     - `hp`: Int (Horsepower)
     - `topSpeed`: String (e.g., `"440 km/h"`)
     - `acceleration`: String (e.g., `"0-100 km/h en 2.2s"`)
     - `engine`: String (e.g., `"8.0L Quad-Turbo W16"`)
     - `status`: String (e.g., `'Disponible'`, `'Reservado'`, `'Vendido'`)
     - `image`: String (URL or path)
     - `description`: Text
     - `createdAt`: DateTime (`@default(now())`)
     - `updatedAt`: DateTime (`@updatedAt`)
   - **NextAuth Authorization Models**:
     - `User`: `id`, `name`, `email` (unique), `emailVerified`, `image`, `role` (default: `"USER"`), `accounts`, `sessions`.
     - `Account`: Standard NextAuth OAuth account mapping model (`userId`, `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`).
     - `Session`: Standard NextAuth session storage (`sessionToken`, `userId`, `expires`).
     - `VerificationToken`: Standard token verification (`identifier`, `token`, `expires`).

3. **Singleton Prisma Client (`app/lib/prisma.ts`)**:
   - Maintains a global `prisma` singleton instance on `globalThis` during development hot-reloading to prevent connection pool exhaustion.

---

### 2.2 NextAuth Google OAuth Strict Email Validation (`app/lib/auth.ts` & `app/api/auth/[...nextauth]/route.ts`)

1. **Provider Configuration**:
   - Google OAuth (`GoogleProvider`) configured via `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

2. **Strict Email Authorization Callback**:
   - Allowed email environment variable: `ADMIN_ALLOWED_EMAIL` (defaulting strictly to `joisrosafer@gmail.com`).
   - `signIn` Callback Guard:
     ```ts
     async signIn({ user }) {
       const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL || "joisrosafer@gmail.com";
       if (user.email !== allowedEmail) {
         return false; // Immediately reject authentication
       }
       return true;
     }
     ```
   - Unauthorized attempts return an `AccessDenied` response and prevent session creation.

3. **JWT Session Strategy**:
   - `session.strategy = "jwt"`.
   - `jwt` Callback: Injects `role: "ADMIN"` into the token if `token.email === ADMIN_ALLOWED_EMAIL`.
   - `session` Callback: Exposes `session.user.role` and `session.user.email` to server/client callers.

4. **Login UI Trigger (`app/admin/login/page.tsx`)**:
   - Replaces static form authentication with NextAuth `signIn("google", { callbackUrl: "/admin/dashboard" })`.

---

### 2.3 REST API Endpoints Architecture

1. **Public Catalog API (`app/api/catalog/route.ts`)**:
   - **Method**: `GET`
   - **Authentication**: Public (no session required).
   - **Query Parameters**:
     - `brand` (optional): Filter by brand string (e.g. `'Bugatti'`).
     - `status` (optional): Filter by status string (e.g. `'Disponible'`).
   - **Database Query**: Queries PostgreSQL via Prisma `prisma.hypercar.findMany()`.
   - **Response**: JSON array of hypercar objects with HTTP 200 OK.

2. **Protected Admin Cars API (`app/api/admin/cars/route.ts`)**:
   - **Method `GET`**:
     - **Authentication**: Requires valid admin session via `getAdminSession()`.
     - **Behavior**: Retrieves full hypercar inventory list for administration.
   - **Method `POST`**:
     - **Authentication**: Requires valid admin session (`joisrosafer@gmail.com`).
     - **Payload**: JSON body validating hypercar fields (`name`, `brand`, `year`, `price`, `hp`, `topSpeed`, `acceleration`, `engine`, `status`, `image`, `description`).
     - **Behavior**: Inserts new record into PostgreSQL database via `prisma.hypercar.create()`.
     - **Response**: HTTP 201 Created with created hypercar object.

3. **Protected Admin Car Item API (`app/api/admin/cars/[id]/route.ts`)**:
   - **Method `PUT`**:
     - **Authentication**: Requires valid admin session.
     - **Payload**: JSON body containing fields to update.
     - **Behavior**: Updates existing record via `prisma.hypercar.update({ where: { id } })`.
   - **Method `DELETE`**:
     - **Authentication**: Requires valid admin session.
     - **Behavior**: Deletes record via `prisma.hypercar.delete({ where: { id } })`.
     - **Response**: HTTP 200 OK or HTTP 204 No Content.

---

### 2.4 Security & Timeout Enforcement

1. **JWT Verification Helper (`app/lib/auth.ts`)**:
   - `getAdminSession(req)` verifies NextAuth JWT secret `NEXTAUTH_SECRET` and validates `session.user.email === (process.env.ADMIN_ALLOWED_EMAIL || "joisrosafer@gmail.com")`.
   - Returns HTTP 401 Unauthorized for unauthenticated callers or HTTP 403 Forbidden for non-admin accounts.

2. **Rate Limiting Guard (`app/lib/rate-limit.ts`)**:
   - In-memory sliding-window token bucket limiter:
     - Public Endpoint (`/api/catalog`): Max 60 requests per minute per IP address.
     - Protected Admin Endpoints (`/api/admin/cars`): Max 30 requests per minute per authenticated admin session.
   - Exceeding limits returns HTTP 429 `Too Many Requests` with `Retry-After` header.

3. **Execution Timeout Protection (`app/lib/timeout.ts`)**:
   - Configures Next.js route segment `export const maxDuration = 10;` (10-second ceiling).
   - Wraps asynchronous database queries in `withTimeout(promise, 10000)` using `Promise.race` to abort long-hanging database connections, returning HTTP 504 Gateway Timeout.

4. **Environment Secret Hygiene**:
   - Template provided in `.env.example`.
   - `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, and `ADMIN_ALLOWED_EMAIL` must remain strictly server-side (never prefixed with `NEXT_PUBLIC_`).

---

## 3. Verification Criteria & Constraints

1. **Schema Validation**: `npx prisma validate` executes without schema errors.
2. **Type Safety & Linting**: `npx tsc --noEmit` and `pnpm lint` pass with zero errors.
3. **Strict Authorization**: Login attempts from any account other than `joisrosafer@gmail.com` are blocked at OAuth callback level.
4. **API Endpoint Functionality**:
   - Unauthenticated GET requests to `/api/catalog` succeed.
   - Unauthenticated requests to `/api/admin/cars` return HTTP 401.
   - Rapid requests exceeding rate limit threshold return HTTP 429.
