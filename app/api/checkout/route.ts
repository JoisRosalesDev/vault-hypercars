import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { CheckoutPayload } from "@/app/types/cart";
import { Hypercar } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const rateLimitError = checkRateLimit(req, {
    limit: 60,
    windowMs: 60 * 1000,
    keyPrefix: "checkout",
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body: CheckoutPayload = await req.json();
    const { items, idempotencyKey } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito de compra no contiene productos válidos." },
        { status: 400 }
      );
    }

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Se requiere un idempotencyKey para procesar la transacción." },
        { status: 400 }
      );
    }

    // Check if order already exists for this idempotencyKey
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey },
    });

    if (existingOrder && existingOrder.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(existingOrder.stripeSessionId);
      if (session.url) {
        return NextResponse.json({
          url: session.url,
          sessionId: session.id,
        });
      }
    }

    // Pre-checkout stock check inside atomic transaction
    const carsMap = new Map<string, Hypercar>();
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item.id || item.quantity <= 0) {
          throw new Error("Ítem inválido en la solicitud de checkout.");
        }
        const car = await tx.hypercar.findUnique({
          where: { id: item.id },
        });

        if (!car) {
          throw new Error(`El vehículo con ID ${item.id} no existe en el catálogo.`);
        }

        if (car.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${car.name}. Stock disponible: ${car.stock}, solicitado: ${item.quantity}`
          );
        }

        carsMap.set(item.id, car);
      }
    });

    // Construct Stripe line items
    let totalAmount = 0;
    const lineItems = items.map((item) => {
      const car = carsMap.get(item.id)!;
      const itemTotal = car.price * item.quantity;
      totalAmount += itemTotal;

      const images: string[] = [];
      if (car.image && (car.image.startsWith("http://") || car.image.startsWith("https://"))) {
        images.push(car.image);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: car.name,
            description: `${car.brand} ${car.name} (${car.year})`,
            images: images.length > 0 ? images : undefined,
          },
          unit_amount: Math.round(car.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";

    // Create Stripe Checkout Session
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

    // Pre-record Order in database with status PENDING
    await prisma.order.upsert({
      where: { idempotencyKey },
      update: {
        stripeSessionId: session.id,
        totalAmount,
        status: "PENDING",
      },
      create: {
        idempotencyKey,
        stripeSessionId: session.id,
        totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item) => {
            const car = carsMap.get(item.id)!;
            return {
              hypercarId: car.id,
              quantity: item.quantity,
              priceUSD: car.price,
            };
          }),
        },
      },
    });

    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error("[API POST /api/checkout Error]:", error);
    return NextResponse.json(
      { error: err.message || "Error al procesar la sesión de checkout." },
      { status: 400 }
    );
  }
}
