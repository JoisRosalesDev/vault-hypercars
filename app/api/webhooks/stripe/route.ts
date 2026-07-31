import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[Webhook Error]: Missing stripe-signature header or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Missing stripe-signature header or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMsg = (err as Error).message;
    console.error(`[Webhook Signature Verification Failed]: ${errorMsg}`);
    return NextResponse.json(
      { error: `Webhook Signature Verification Error: ${errorMsg}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSessionId = session.id;
        const customerEmail =
          session.customer_details?.email || session.customer_email || null;
        const idempotencyKey = session.metadata?.idempotencyKey;

        await prisma.$transaction(async (tx) => {
          const order = await tx.order.findFirst({
            where: {
              OR: [
                { stripeSessionId },
                ...(idempotencyKey ? [{ idempotencyKey }] : []),
              ],
            },
            include: { items: true },
          });

          if (!order) {
            console.warn(
              `[Webhook] Order not found for session ${stripeSessionId} / idempotencyKey ${idempotencyKey}`
            );
            return;
          }

          if (order.status === "COMPLETED") {
            return;
          }

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "COMPLETED",
              customerEmail: customerEmail || order.customerEmail,
              stripeSessionId: session.id,
            },
          });

          for (const item of order.items) {
            const car = await tx.hypercar.findUnique({
              where: { id: item.hypercarId },
            });

            if (car) {
              const newStock = Math.max(0, car.stock - item.quantity);
              let newStatus = car.status;
              if (newStock === 0) {
                newStatus = "Vendido";
              } else if (newStock === 1) {
                newStatus = "Unidad Final";
              }

              await tx.hypercar.update({
                where: { id: car.id },
                data: {
                  stock: newStock,
                  status: newStatus,
                },
              });
            }
          }
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSessionId = session.id;
        const idempotencyKey = session.metadata?.idempotencyKey;

        await prisma.order.updateMany({
          where: {
            OR: [
              { stripeSessionId },
              ...(idempotencyKey ? [{ idempotencyKey }] : []),
            ],
            status: "PENDING",
          },
          data: {
            status: "EXPIRED",
          },
        });
        break;
      }

      default:
        // Unhandled event types
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API POST /api/webhooks/stripe Error]:", error);
    return NextResponse.json(
      { error: err.message || "Failed to process Stripe webhook event" },
      { status: 500 }
    );
  }
}
