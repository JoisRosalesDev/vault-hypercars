# Technical Design Document: Backend Supabase & Strict Google OAuth Production Integration

**Change ID**: `backend-supabase-auth-production`  
**Mode**: `hybrid`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  
**Status**: Proposed Technical Design  

---

## 1. Executive Summary & Architectural Goals

The `backend-supabase-auth-production` change transitions the Vault Hypercars platform from local static catalog data and simulated admin logins to an enterprise-grade backend infrastructure. Key objectives include:

1. **Database Persistence**: PostgreSQL database hosted on Supabase managed via Prisma ORM (`prisma`, `@prisma/client`) with dual connection configurations (pgBouncer transaction pooler for API routes and direct connection for CLI migrations).
2. **Strict Identity & Access Management**: NextAuth / Auth.js integrated with Google OAuth, guarded by a strict email check enforcing that **only** `joisrosafer@gmail.com` can sign in as administrator. All unauthorized email login attempts are rejected during the OAuth sign-in callback.
3. **Real Data REST API Architecture**: Production-ready API routes for public inventory queries (`/api/catalog`) and protected admin CRUD operations (`/api/admin/cars` and `/api/admin/cars/[id]`).
4. **Security, Resilience & Rate Limiting**: Centralized JWT session verification helpers (`getAdminSession`), sliding-window in-memory IP/session rate limiting (`rate-limit.ts`), and 10-second route execution timeout wrappers (`timeout.ts`).
5. **Environment Standardization**: Production `.env.example` defining database URLs, OAuth credentials, session secrets, and explicit email restriction rules.

---

## 2. Target Directory & File Structure

```
vault-hypercars/
├── prisma/
│   ├── schema.prisma            # Database schema for Hypercar & NextAuth models
│   └── seed.ts                  # Production dataset population script
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth App Router GET/POST handler
│   │   ├── catalog/
│   │   │   └── route.ts         # Public GET catalog API (with filter support)
│   │   └── admin/
│   │       └── cars/
│   │           ├── route.ts     # Protected GET (list) & POST (create) endpoints
│   │           └── [id]/
│   │               └── route.ts # Protected PUT (update) & DELETE endpoints
│   ├── lib/
│   │   ├── prisma.ts            # Singleton Prisma Client instance
│   │   ├── auth.ts              # NextAuth options & admin session verification helpers
│   │   ├── rate-limit.ts        # Sliding-window IP/session rate limiter helper
│   │   └── timeout.ts           # 10s route timeout wrapper & error handler
│   ├── admin/
│   │   ├── login/page.tsx       # Updated Google OAuth Sign-in UI
│   │   └── dashboard/page.tsx   # Dashboard wired to live /api/admin/cars API
│   └── types/
│       ├── catalog.ts           # Hypercar & brand interfaces
│       └── admin.ts             # Admin dashboard & API contract types
├── .env.example                 # Production environment variable reference template
└── openspec/
    └── changes/
        └── backend-supabase-auth-production/
            ├── proposal.md      # Proposal specification
            └── design.md        # Technical design document (This file)
```

---

## 3. Database Schema & Prisma Client (`prisma/schema.prisma` & `app/lib/prisma.ts`)

### 3.1 `prisma/schema.prisma` Structure

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Hypercar {
  id           String   @id @default(cuid())
  name         String
  brand        String   // "Bugatti" | "Lamborghini" | "Ferrari"
  year         Int
  price        Float    // Base price in USD
  hp           Int      // Horsepower output
  topSpeed     String   // e.g. "445 km/h"
  acceleration String   // e.g. "0-100 km/h en 2.0s"
  engine       String   // e.g. "V16 8.3L Atmosférico"
  status       String   // "Disponible" | "Reservado" | "Vendido"
  image        String   // URL or local asset path
  description  String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([brand])
  @@index([status])
}

// NextAuth Required Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 3.2 Singleton Prisma Client (`app/lib/prisma.ts`)

To prevent multiple connection pools during Next.js hot module reloading:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## 4. Authentication & Strict Authorization (`app/lib/auth.ts` & `app/api/auth/[...nextauth]/route.ts`)

### 4.1 NextAuth Options & Admin Guard (`app/lib/auth.ts`)

The NextAuth configuration strictly guards access at the OAuth callback layer, checking the user's Google email against `ADMIN_ALLOWED_EMAIL` (defaulting strictly to `joisrosafer@gmail.com`).

```typescript
import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_ALLOWED_EMAIL || "joisrosafer@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 Hours
  },
  callbacks: {
    async signIn({ user }) {
      // Strict Email Guard: Block authentication immediately if email does not match allowed admin
      if (!user.email || user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        console.warn(`[AUTH GUARD REJECTED] Unauthorized sign-in attempt by: ${user.email}`);
        return false; // Triggers AccessDenied error
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = "ADMIN";
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Server-side helper to verify if the current request is from an authenticated Admin session.
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    return null;
  }
  return session;
}
```

### 4.2 Auth Route Handler (`app/api/auth/[...nextauth]/route.ts`)

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## 5. REST API Handler Architecture

### 5.1 Public Catalog Handler (`app/api/catalog/route.ts`)

- **Route**: `GET /api/catalog`
- **Access**: Public (Unauthenticated)
- **Features**: Rate limiting (60 req/min/IP), optional brand/status query filtering, 10s operation timeout.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  // 1. Rate limiting (60 requests / min per IP)
  const rateLimitError = checkRateLimit(req, { limit: 60, windowMs: 60 * 1000, keyPrefix: "catalog" });
  if (rateLimitError) return rateLimitError;

  try {
    const { searchParams } = new URL(req.url);
    const brandFilter = searchParams.get("brand");
    const statusFilter = searchParams.get("status");

    const whereClause: Record<string, string> = {};
    if (brandFilter && brandFilter.toLowerCase() !== "all") {
      whereClause.brand = brandFilter;
    }
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    // 2. Fetch inventory with 10s query timeout
    const cars = await withTimeout(
      prisma.hypercar.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      }),
      9000,
      "Database request timed out while fetching catalog"
    );

    return NextResponse.json(cars, { status: 200 });
  } catch (error: any) {
    console.error("[API GET /api/catalog Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch catalog inventory" },
      { status: error.status || 500 }
    );
  }
}
```

---

### 5.2 Protected Admin Cars Collection Handler (`app/api/admin/cars/route.ts`)

- **Route**: `GET /api/admin/cars`, `POST /api/admin/cars`
- **Access**: Protected (Strict Admin Session Required)
- **Features**: Admin session verification, rate limiting (30 req/min/session), request body validation.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const maxDuration = 10;

// Helper to enforce admin auth
async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin_cars_get" });
  if (rateLimitError) return rateLimitError;

  try {
    const cars = await withTimeout(
      prisma.hypercar.findMany({
        orderBy: { createdAt: "desc" },
      }),
      9000
    );
    return NextResponse.json(cars, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin hypercars" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin_cars_post" });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await req.json();

    const { name, brand, year, price, hp, topSpeed, acceleration, engine, status, image, description } = body;

    if (!name || !brand || !year || !price || !hp || !topSpeed || !status || !image) {
      return NextResponse.json({ error: "Missing required hypercar fields" }, { status: 400 });
    }

    const newCar = await withTimeout(
      prisma.hypercar.create({
        data: {
          name,
          brand,
          year: Number(year),
          price: Number(price),
          hp: Number(hp),
          topSpeed,
          acceleration: acceleration || "N/A",
          engine: engine || "N/A",
          status,
          image,
          description: description || "",
        },
      }),
      9000
    );

    return NextResponse.json(newCar, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create hypercar record" }, { status: 500 });
  }
}
```

---

### 5.3 Protected Admin Car Item Handler (`app/api/admin/cars/[id]/route.ts`)

- **Route**: `PUT /api/admin/cars/[id]`, `DELETE /api/admin/cars/[id]`
- **Access**: Protected (Strict Admin Session Required)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const maxDuration = 10;

async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin_cars_put" });
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = params;
    const body = await req.json();

    const updatedCar = await withTimeout(
      prisma.hypercar.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.brand && { brand: body.brand }),
          ...(body.year && { year: Number(body.year) }),
          ...(body.price && { price: Number(body.price) }),
          ...(body.hp && { hp: Number(body.hp) }),
          ...(body.topSpeed && { topSpeed: body.topSpeed }),
          ...(body.acceleration && { acceleration: body.acceleration }),
          ...(body.engine && { engine: body.engine }),
          ...(body.status && { status: body.status }),
          ...(body.image && { image: body.image }),
          ...(body.description !== undefined && { description: body.description }),
        },
      }),
      9000
    );

    return NextResponse.json(updatedCar, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update hypercar record" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin_cars_delete" });
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = params;

    await withTimeout(
      prisma.hypercar.delete({
        where: { id },
      }),
      9000
    );

    return NextResponse.json({ success: true, message: `Hypercar ${id} deleted successfully` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete hypercar record" }, { status: 500 });
  }
}
```

---

## 6. Resilience & Security Helpers (`app/lib/rate-limit.ts` & `app/lib/timeout.ts`)

### 6.1 Rate Limit Helper (`app/lib/rate-limit.ts`)

Implements a sliding-window rate limiter checking client IP (from `x-forwarded-for` or `x-real-ip`).

```typescript
import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  limit: number;       // Maximum requests allowed in the window
  windowMs: number;    // Time window in milliseconds
  keyPrefix?: string;  // Namespace for key separation
}

export function checkRateLimit(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
  const key = `${options.keyPrefix || "rl"}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return null;
  }

  if (record.count >= options.limit) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: retryAfterSeconds },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(options.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  record.count += 1;
  return null;
}
```

### 6.2 Route Execution Timeout Guard (`app/lib/timeout.ts`)

```typescript
export class TimeoutError extends Error {
  status: number;
  constructor(message = "Request execution timed out") {
    super(message);
    this.name = "TimeoutError";
    this.status = 504;
  }
}

/**
 * Wraps an async Promise execution with a timeout limit.
 * If the promise does not resolve within `ms` milliseconds, rejects with a TimeoutError.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 9000,
  customErrorMsg = "Operation timed out"
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(customErrorMsg));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
```

---

## 7. Production Environment Configuration (`.env.example`)

The `.env.example` template at the project root:

```env
# ==============================================================================
# VAULT HYPERCARS - PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================

# ------------------------------------------------------------------------------
# DATABASE CONNECTION (Supabase PostgreSQL)
# ------------------------------------------------------------------------------
# Pooled database URL for API runtime routes (pgBouncer transaction mode / port 6543)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct database URL for Prisma migrations, seeding, and CLI commands (port 5432)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres"

# ------------------------------------------------------------------------------
# NEXTAUTH / AUTH.JS CONFIGURATION
# ------------------------------------------------------------------------------
# Base URL of the application
NEXTAUTH_URL="http://localhost:3000"

# Cryptographically secure random key for JWT token signing & encryption
# Generate via: `openssl rand -base64 32`
NEXTAUTH_SECRET="your-super-secret-random-32-character-string"

# ------------------------------------------------------------------------------
# GOOGLE OAUTH CREDENTIALS (Google Cloud Console)
# ------------------------------------------------------------------------------
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ------------------------------------------------------------------------------
# STRICT ADMIN AUTHORIZATION RULE
# ------------------------------------------------------------------------------
# Only users authenticated with this exact email address are granted access to Admin APIs
ADMIN_ALLOWED_EMAIL="joisrosafer@gmail.com"
```

---

## 8. Verification & Quality Assurance Plan

### 8.1 Build & Type Safety Verification
- **Prisma Schema Validation**: Run `npx prisma validate` to ensure zero syntax errors in `prisma/schema.prisma`.
- **TypeScript Compilation**: Run `npx tsc --noEmit` to verify type checking across all API routes, libraries, and components.
- **Linter Check**: Run `pnpm lint` to confirm strict code formatting compliance.

### 8.2 Security & OAuth Authorization Testing Matrix

| Scenario | Request / Input | Expected Result | Status Code |
| :--- | :--- | :--- | :--- |
| **Allowed OAuth Sign-in** | Google OAuth login with `joisrosafer@gmail.com` | Sign-in succeeds, JWT issued, redirect to `/admin/dashboard` | 200 / 302 |
| **Blocked OAuth Sign-in** | Google OAuth login with `unauthorized@gmail.com` | Sign-in rejected at callback level, redirect to `/admin/login?error=AccessDenied` | 302 |
| **Unauthenticated Admin API** | `GET /api/admin/cars` without session cookie | Returns `{ "error": "Unauthorized access" }` | 401 Unauthorized |
| **Unauthenticated POST API** | `POST /api/admin/cars` with hypercar body | Returns `{ "error": "Unauthorized access" }` | 401 Unauthorized |
| **Public Catalog Access** | `GET /api/catalog?brand=Bugatti` | Returns list of Bugatti hypercars from Supabase PostgreSQL | 200 OK |
| **Rate Limit Trigger** | > 60 GET requests/min to `/api/catalog` from single IP | Returns `{ "error": "Too many requests..." }` | 429 Too Many Requests |
| **Execution Timeout** | Hanging database connection (> 9s) | Timeout wrapper triggers TimeoutError | 504 Gateway Timeout |
