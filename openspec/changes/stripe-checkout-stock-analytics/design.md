# Technical Design Document: Stripe Checkout Integration, Stock Management & Real Analytics

**Change ID**: `stripe-checkout-stock-analytics`  
**Target Project**: Vault Hypercars Platform (`vault-hypercars`)  
**Mode**: `hybrid`  
**Created At**: 2026-07-31  

---

## 1. Executive Summary & Architectural Goals

The Vault Hypercars platform currently relies on client-side cart drawer state with simulated alert checkouts, lacks explicit inventory stock tracking, experiences catalog filter mismatches due to string casing (`"bugatti"` vs `"Bugatti"`), relies on static mock analytics figures, and exhibits header overflow on mobile viewports.

This technical design details the implementation plan for:
1. **Prisma Database Schema Extensions**: Adding `stock` to [Hypercar](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/prisma/schema.prisma) and introducing `Order` and `OrderItem` models to track transactions and calculate real revenue.
2. **Stripe Checkout API & Idempotency**: Implementing `/api/checkout` with atomic `prisma.$transaction` stock pre-checks and mandatory Stripe idempotency keys to prevent duplicate billing and race conditions.
3. **Stripe Webhook Listener**: Implementing `/api/webhooks/stripe` to handle `checkout.session.completed` (decrements stock, updates order/vehicle statuses) and `checkout.session.expired`.
4. **Case-Insensitive Brand Filtering**: Updating `/api/catalog` with Prisma `mode: 'insensitive'` filter queries.
5. **Real-Time Dynamic Analytics Engine**: Creating `/api/admin/analytics` to compute active inventory valuation, unit counts, monthly revenue, and conversion rate dynamically from live database tables.
6. **Component Props & UI Refactoring**: Updating [ProductCard](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/catalog/ProductCard.tsx), [CatalogModal](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/catalog/CatalogModal.tsx), [CartDrawer](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/cart/CartDrawer.tsx), [AdminModals](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/admin/AdminModals.tsx), [CatalogTable](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/admin/CatalogTable.tsx), [DashboardAnalytics](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/components/admin/DashboardAnalytics.tsx), and the Admin Header layout in [app/admin/dashboard/page.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/admin/dashboard/page.tsx).

---

## 2. Database Schema & Type System Specification

### 2.1 Prisma Schema Updates (`prisma/schema.prisma`)

Update [prisma/schema.prisma](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/prisma/schema.prisma) to add inventory stock tracking and transaction logging.

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

model Order {
  id                String      @id @default(cuid())
  stripeSessionId   String      @unique
  idempotencyKey    String      @unique
  customerEmail     String?
  totalAmount       Float       // Order total amount in USD
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

  @@index([orderId])
  @@index([hypercarId])
}
```

### 2.2 TypeScript Interface Extensions

#### `app/types/catalog.ts`
Extend `CatalogItem` with `stock: number`:

```ts
export interface CatalogItem {
  id: string;
  name: string;
  brand: Brand;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  stock: number; // Extended explicit stock count
  status: ItemStatus;
  description: string;
  image: string;
  specs?: HypercarSpecs;
}
```

#### `app/types/cart.ts`
Add checkout payload and state interfaces:

```ts
export interface CheckoutItemPayload {
  id: string;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItemPayload[];
  idempotencyKey: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}
```

#### `app/types/admin.ts`
Extend `CatalogFormData` with `stock: number`:

```ts
export interface CatalogFormData {
  id?: string;
  brand: Brand;
  name: string;
  year: string;
  power: string;
  topSpeed: string;
  priceUSD: number;
  stock: number; // Form input for stock control
  currency?: "USD" | "EUR" | "GBP" | "AED";
  status: ItemStatus;
  description: string;
  image: string;
}
```

---

## 3. Server Architecture & API Endpoints

### 3.1 Server-Side Stripe SDK Client (`app/lib/stripe.ts`)

Create a singleton Stripe SDK instance:

```ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe SDK] Missing STRIPE_SECRET_KEY environment variable.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
  typescript: true,
});
```

---

### 3.2 Stripe Checkout Sessions API (`app/api/checkout/route.ts`)

- **Method**: `POST`
- **Rate Limit**: 60 requests/minute per IP (`keyPrefix: "checkout"`).
- **Execution Timeout**: 10s maximum duration (`withTimeout`).
- **Request Body**: `CheckoutPayload` (`{ items: [{ id: string, quantity: number }], idempotencyKey: string }`).

#### Sequence & Control Flow:
```
Client (CartDrawer) ---> POST /api/checkout ---> Rate Limiter Guard
                                                     │
                                                     ▼
                                        Prisma Interactive Transaction
                                         (Stock Guard: car.stock >= quantity)
                                                     │
                                      [If insufficient stock: Return 400]
                                                     │
                                                     ▼
                                        Stripe Sessions API Request
                                        (idempotencyKey: `cs_${idempotencyKey}`)
                                                     │
                                                     ▼
                                        Create Order (Status: "PENDING")
                                        Create OrderItem records
                                                     │
                                                     ▼
                                        Return { url, sessionId } -> HTTP 200
```

#### Code Specification (`app/api/checkout/route.ts`):
```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const rateLimitErr = checkRateLimit(req, { limit: 60, windowMs: 60 * 1000, keyPrefix: "checkout" });
  if (rateLimitErr) return rateLimitErr;

  try {
    const body = await req.json();
    const { items, idempotencyKey } = body || {};

    if (!Array.isArray(items) || items.length === 0 || !idempotencyKey) {
      return NextResponse.json(
        { error: "Payload inválido: se requieren elementos del carrito y clave de idempotencia." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const sessionData = await withTimeout(
      prisma.$transaction(async (tx) => {
        // 1. Verify stock availability atomically
        const lineItems = [];
        const orderItemData = [];
        let totalAmountUSD = 0;

        for (const item of items) {
          const car = await tx.hypercar.findUnique({ where: { id: item.id } });
          if (!car) {
            throw new Error(`Vehículo no encontrado: ID ${item.id}`);
          }
          if (car.stock < item.quantity) {
            throw new Error(`Stock insuficiente para "${car.name}". Disponibles: ${car.stock}`);
          }

          const itemTotal = car.price * item.quantity;
          totalAmountUSD += itemTotal;

          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: `${car.brand} ${car.name}`,
                images: car.image ? [car.image] : [],
                description: `Hiperauto ${car.year} - ${car.hp} HP`,
              },
              unit_amount: Math.round(car.price * 100), // Stripe expects cents
            },
            quantity: item.quantity,
          });

          orderItemData.push({
            hypercarId: car.id,
            quantity: item.quantity,
            priceUSD: car.price,
          });
        }

        // 2. Create Stripe Checkout Session with idempotency key header
        const session = await stripe.checkout.sessions.create(
          {
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?checkout=cancelled`,
            metadata: {
              idempotencyKey,
            },
          },
          {
            idempotencyKey: `cs_${idempotencyKey}`,
          }
        );

        // 3. Pre-record PENDING order in DB
        await tx.order.create({
          data: {
            stripeSessionId: session.id,
            idempotencyKey,
            totalAmount: totalAmountUSD,
            currency: "usd",
            status: "PENDING",
            items: {
              create: orderItemData,
            },
          },
        });

        return { url: session.url, sessionId: session.id };
      }),
      9000,
      "Checkout transaction timed out"
    );

    return NextResponse.json(sessionData, { status: 200 });
  } catch (error: any) {
    console.error("[API POST /api/checkout Error]:", error);
    return NextResponse.json(
      { error: error.message || "Error procesando el checkout con Stripe" },
      { status: error.status || 400 }
    );
  }
}
```

---

### 3.3 Stripe Webhook Handler (`app/api/webhooks/stripe/route.ts`)

- **Method**: `POST`
- **Signature Verification**: Validated using `stripe.webhooks.constructEvent(bodyText, sig, STRIPE_WEBHOOK_SECRET)`.
- **Event Handling**:
  - `checkout.session.completed`:
    - Reads session ID.
    - Inside `prisma.$transaction`:
      - Updates `Order` status to `"COMPLETED"` and logs `customerEmail = session.customer_details?.email`.
      - Decrements `Hypercar.stock` by `quantity` for each item.
      - Adjusts `Hypercar.status`: if `stock <= 0` set status to `"Vendido"`, if `stock === 1` set status to `"Unidad Final"`, otherwise `"Disponible"`.
  - `checkout.session.expired`:
    - Updates `Order` status to `"EXPIRED"`.

#### Code Specification (`app/api/webhooks/stripe/route.ts`):
```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/app/lib/stripe";
import { prisma } from "@/app/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
    return NextResponse.json({ error: `Webhook Signature Verification Failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const customerEmail = session.customer_details?.email || session.customer_email || null;

        await prisma.$transaction(async (tx) => {
          const existingOrder = await tx.order.findUnique({
            where: { stripeSessionId: sessionId },
            include: { items: true },
          });

          if (!existingOrder) {
            console.warn(`[Stripe Webhook] Order not found for session ${sessionId}`);
            return;
          }

          if (existingOrder.status === "COMPLETED") {
            console.log(`[Stripe Webhook] Order ${sessionId} already processed.`);
            return;
          }

          // 1. Mark Order completed
          await tx.order.update({
            where: { id: existingOrder.id },
            data: {
              status: "COMPLETED",
              customerEmail,
            },
          });

          // 2. Decrement stock and update status for each hypercar
          for (const item of existingOrder.items) {
            const updatedCar = await tx.hypercar.update({
              where: { id: item.hypercarId },
              data: {
                stock: { decrement: item.quantity },
              },
            });

            // Determine status based on new stock level
            let newStatus = updatedCar.status;
            if (updatedCar.stock <= 0) {
              newStatus = "Vendido";
            } else if (updatedCar.stock === 1) {
              newStatus = "Unidad Final";
            } else if (updatedCar.stock > 1 && updatedCar.status === "Vendido") {
              newStatus = "Disponible";
            }

            if (newStatus !== updatedCar.status) {
              await tx.hypercar.update({
                where: { id: updatedCar.id },
                data: { status: newStatus },
              });
            }
          }
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await prisma.order.updateMany({
          where: { stripeSessionId: session.id, status: "PENDING" },
          data: { status: "EXPIRED" },
        });
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Stripe Webhook Handler Error]:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
```

---

### 3.4 Brand Filter Casing Normalization (`app/api/catalog/route.ts`)

Update [app/api/catalog/route.ts](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/api/catalog/route.ts) to apply Prisma `mode: "insensitive"` on brand filter parameters:

```ts
// Search parameter brand parsing with insensitive matching
const whereClause: any = {};

if (brandFilter && brandFilter.toLowerCase() !== "all") {
  whereClause.brand = {
    equals: brandFilter,
    mode: "insensitive",
  };
}

if (statusFilter) {
  whereClause.status = statusFilter;
}
```

---

### 3.5 Dynamic Real Data Analytics Endpoint (`app/api/admin/analytics/route.ts`)

- **Method**: `GET`
- **Auth Guard**: Protected via `getAdminSession(req)`.
- **Rate Limit**: 30 requests/minute per session.
- **Calculations**:
  1. `totalInventoryUSD`: Aggregate sum of `(price * stock)` for hypercars where `status != 'Vendido'`.
  2. `activeUnitsCount`: Sum of `stock` where `stock > 0`.
  3. `monthlyRevenueUSD`: Aggregate sum of `totalAmount` for `Order` records where `status = 'COMPLETED'` created within the current calendar month.
  4. `conversionRate`: Calculated as `(completedOrdersCount / totalOrdersCount) * 100` rounded to 1 decimal place (default to `0.0` if `totalOrdersCount === 0`).

#### Code Specification (`app/api/admin/analytics/route.ts`):
```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado. Sesión de administrador requerida." }, { status: 401 });
  }

  const rateLimitErr = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin-analytics" });
  if (rateLimitErr) return rateLimitErr;

  try {
    const metrics = await withTimeout(
      (async () => {
        // 1. Fetch hypercar inventory records
        const cars = await prisma.hypercar.findMany({
          select: { price: true, stock: true, status: true },
        });

        const activeCars = cars.filter((c) => c.status !== "Vendido" && c.stock > 0);
        const totalInventoryUSD = activeCars.reduce((sum, car) => sum + car.price * car.stock, 0);
        const activeUnitsCount = activeCars.reduce((sum, car) => sum + car.stock, 0);

        // 2. Fetch monthly revenue
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyOrders = await prisma.order.findMany({
          where: {
            createdAt: { gte: startOfMonth },
            status: "COMPLETED",
          },
          select: { totalAmount: true },
        });

        const monthlyRevenueUSD = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        // 3. Conversion Rate
        const totalOrdersCount = await prisma.order.count();
        const completedOrdersCount = await prisma.order.count({ where: { status: "COMPLETED" } });

        const rawConversionRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;
        const conversionRate = Number(rawConversionRate.toFixed(1));

        return {
          totalInventoryUSD,
          activeUnitsCount,
          monthlyRevenueUSD,
          conversionRate,
        };
      })(),
      9000,
      "Analytics calculation timed out"
    );

    return NextResponse.json(metrics, { status: 200 });
  } catch (error: any) {
    console.error("[API GET /api/admin/analytics Error]:", error);
    return NextResponse.json(
      { error: error.message || "Error al calcular analíticas del sistema" },
      { status: 500 }
    );
  }
}
```

---

## 4. Frontend Components & UI Refactoring

### 4.1 `ProductCard.tsx` Updates (`app/components/catalog/ProductCard.tsx`)

Render dynamic stock indicators based on `item.stock`:
- `stock > 1`: Display emerald badge `Stock: {item.stock} unidades`.
- `stock === 1`: Display amber badge `¡Última unidad disponible!`.
- `stock === 0`: Display rose badge `AGOTADO` and disable `"AÑADIR AL CARRITO"` CTA button.

```tsx
{/* Stock Level Badge */}
<div className="flex justify-between items-center mb-5">
  <span className="px-3 py-1 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 text-[10px] font-extrabold text-[#f5d061] tracking-[0.2em] uppercase">
    {item.brand}
  </span>

  <span
    className={`text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
      item.stock === 0
        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
        : item.stock === 1
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        item.stock === 0 ? "bg-rose-400" : item.stock === 1 ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-pulse"
      }`}
    />
    {item.stock === 0 ? "AGOTADO" : item.stock === 1 ? "¡Última unidad!" : `Stock: ${item.stock} u.`}
  </span>
</div>

{/* Action Button */}
<button
  onClick={() => onAddToCart(item)}
  disabled={item.stock === 0}
  className={`flex-1 py-3.5 text-xs font-extrabold tracking-[0.15em] rounded transition-all duration-200 flex items-center justify-center gap-2 ${
    item.stock === 0
      ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
      : "bg-[#d4af37] text-black hover:bg-[#f5d061] active:scale-[0.97] shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer"
  }`}
>
  <ShoppingCartIcon className="w-4 h-4" /> {item.stock === 0 ? "SIN STOCK" : "AÑADIR AL CARRITO"}
</button>
```

---

### 4.2 `CatalogModal.tsx` Updates (`app/components/catalog/CatalogModal.tsx`)

Display live `stock` line item in vehicle specs list and disable cart CTA when `item.stock === 0`:

```tsx
<div className="flex justify-between text-sm">
  <span className="text-zinc-400">Unidades en Inventario:</span>
  <span className={`font-bold ${item.stock === 0 ? "text-rose-400" : item.stock === 1 ? "text-amber-400" : "text-emerald-400"}`}>
    {item.stock === 0 ? "Sin stock disponible" : `${item.stock} unidades`}
  </span>
</div>

<button
  onClick={handleAdd}
  disabled={item.stock === 0}
  className={`w-full py-4 text-xs font-extrabold tracking-[0.2em] rounded transition-all flex items-center justify-center gap-2 ${
    item.stock === 0
      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
      : "bg-[#d4af37] text-black hover:bg-[#f5d061] shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
  }`}
>
  <ShoppingCartIcon className="w-4 h-4" /> {item.stock === 0 ? "VEHÍCULO AGOTADO" : "COMPRAR AHORA Y AÑADIR AL CARRITO"}
</button>
```

---

### 4.3 `CartDrawer.tsx` Updates (`app/components/cart/CartDrawer.tsx`)

Replace simple `alert(...)` with Stripe Checkout API invocation using client-side UUID idempotency keys:

```tsx
const [isCheckingOut, setIsCheckingOut] = useState(false);
const [checkoutError, setCheckoutError] = useState<string | null>(null);

const handleCheckout = async () => {
  if (cart.length === 0 || isCheckingOut) return;
  setIsCheckingOut(true);
  setCheckoutError(null);

  try {
    const idempotencyKey = crypto.randomUUID();
    const payload: CheckoutPayload = {
      items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      idempotencyKey,
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Fallo al iniciar el checkout con Stripe.");
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No se recibió la URL de redirección a Stripe.");
    }
  } catch (err: any) {
    console.error("[Checkout Error]:", err);
    setCheckoutError(err.message || "Fallo en la comunicación con la pasarela de pago.");
    setIsCheckingOut(false);
  }
};
```

---

### 4.4 `CatalogTable.tsx` & `AdminModals.tsx` Updates

#### `CatalogTable.tsx`
Add `"STOCK"` header column and render `item.stock`:

```tsx
<th className="py-4 px-4">STOCK</th>
...
<td className="py-4 px-4 font-bold">
  <span className={`px-2.5 py-1 rounded text-xs ${item.stock === 0 ? "bg-rose-500/10 text-rose-400" : "bg-zinc-800 text-white"}`}>
    {item.stock} u.
  </span>
</td>
```

#### `AdminModals.tsx`
Include integer `<input type="number" min="0" name="stock" />` inside creation and editing modal forms:

```tsx
<div>
  <label className="block text-xs font-semibold text-zinc-400 mb-2">UNIDADES EN STOCK</label>
  <input
    type="number"
    min="0"
    value={formData.stock}
    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
    className="w-full px-4 py-3 rounded bg-[#08080a] border border-white/15 text-sm text-white focus:border-[#d4af37] focus:outline-none"
  />
</div>
```

---

### 4.5 `DashboardAnalytics.tsx` Updates (`app/components/admin/DashboardAnalytics.tsx`)

Render metrics computed dynamically from DB:

```tsx
export function DashboardAnalytics({ metrics }: DashboardAnalyticsProps) {
  const { totalInventoryUSD, activeUnitsCount, monthlyRevenueUSD, conversionRate } = metrics;
  const inventoryInMillions = (totalInventoryUSD / 1000000).toFixed(2);
  const revenueInMillions = (monthlyRevenueUSD / 1000000).toFixed(2);

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">VALOR INVENTARIO TOTAL</span>
        <div className="text-3xl font-black text-white">${inventoryInMillions}M USD</div>
        <span className="text-[11px] text-emerald-400 mt-2 block font-medium">Valoración en tiempo real</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">UNIDADES ACTIVAS</span>
        <div className="text-3xl font-black text-[#f5d061]">{activeUnitsCount} AUTOS</div>
        <span className="text-[11px] text-zinc-400 mt-2 block font-medium">Bugatti • Lamborghini • Ferrari</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">VENTAS DEL MES</span>
        <div className="text-3xl font-black text-white">${revenueInMillions}M USD</div>
        <span className="text-[11px] text-emerald-400 mt-2 block font-medium">Ingresos reales por Stripe</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#0d0d12] border border-white/10">
        <span className="text-xs text-zinc-500 font-semibold tracking-wider block mb-1">TASA DE CONVERSIÓN VIP</span>
        <div className="text-3xl font-black text-[#d4af37]">{conversionRate}%</div>
        <span className="text-[11px] text-zinc-400 mt-2 block font-medium">Órdenes completadas / totales</span>
      </div>
    </section>
  );
}
```

---

### 4.6 Admin Dashboard Header Layout Fix (`app/admin/dashboard/page.tsx`)

Refactor the `<header>` element and dynamic analytics fetch:

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

Add analytics fetching logic in [app/admin/dashboard/page.tsx](file:///C:/Users/rosal/OneDrive/Documentos/Dev/vault-hypercars/app/admin/dashboard/page.tsx):
```ts
const [metrics, setMetrics] = useState<DashboardMetrics>({
  totalInventoryUSD: 0,
  activeUnitsCount: 0,
  monthlyRevenueUSD: 0,
  conversionRate: 0,
});

const fetchAnalytics = useCallback(async () => {
  try {
    const res = await fetch("/api/admin/analytics");
    if (res.ok) {
      const data = await res.json();
      setMetrics(data);
    }
  } catch (err) {
    console.error("[Analytics Fetch Error]:", err);
  }
}, []);
```

---

## 5. Verification & Technical Quality Plan

1. **Type Safety & Build Verification**:
   - Run `npx prisma validate` to confirm schema integrity.
   - Run `npx tsc --noEmit` to verify strict TypeScript adherence across models, route handlers, and React components.
   - Run `pnpm lint` to check for zero lint errors or warnings.
2. **Brand Filtering Test Cases**:
   - Test `GET /api/catalog?brand=bugatti`, `GET /api/catalog?brand=Lamborghini`, `GET /api/catalog?brand=FERRARI`.
   - Verify all return non-empty vehicle arrays with HTTP 200.
3. **Idempotency & Race Condition Verification**:
   - Issue multiple concurrent requests to `/api/checkout` with identical `idempotencyKey`; confirm Stripe returns the exact same session object without creating duplicate orders.
   - Request checkout for vehicle with `stock = 1`; confirm concurrent transaction fails with HTTP 400 "Stock insuficiente".
4. **Webhook & Stock Decrement Verification**:
   - Trigger `stripe trigger checkout.session.completed` locally.
   - Verify `Order` status updates from `"PENDING"` to `"COMPLETED"`, `stock` is decremented in PostgreSQL, and status switches to `"Vendido"` if `stock <= 0`.
5. **Responsive Admin Layout Audit**:
   - Test `app/admin/dashboard/page.tsx` across 320px, 375px, 414px, 768px, and 1280px screen widths to ensure zero text overflow, clipping, or unwanted horizontal scrollbars.
