import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { PrivacyRequestPayload } from "@/app/types/privacy";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        hypercar: true;
      };
    };
  };
}>;

type OrderItemWithHypercar = Prisma.OrderItemGetPayload<{
  include: {
    hypercar: true;
  };
}>;

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const rateLimitError = checkRateLimit(req, {
    limit: 60,
    windowMs: 60 * 1000,
    keyPrefix: "privacy",
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body: PrivacyRequestPayload = await req.json();
    const { email, action } = body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Debe proporcionar un correo electrónico válido." },
        { status: 400 }
      );
    }

    if (action !== "export" && action !== "delete") {
      return NextResponse.json(
        { error: "Acción no válida. Las acciones permitidas son 'export' y 'delete'." },
        { status: 400 }
      );
    }

    if (action === "export") {
      const orders = await prisma.order.findMany({
        where: { customerEmail: email },
        include: {
          items: {
            include: {
              hypercar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      const sanitizedOrders = orders.map((o: OrderWithItems) => ({
        id: o.id,
        totalAmount: o.totalAmount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
        items: (o.items || []).map((item: OrderItemWithHypercar) => ({
          carName: item.hypercar?.name || "Hiperauto",
          brand: item.hypercar?.brand || "Vault",
          quantity: item.quantity,
          priceUSD: item.priceUSD,
        })),
      }));

      return NextResponse.json({
        email,
        requestDate: new Date().toISOString(),
        orders: sanitizedOrders,
        message: sanitizedOrders.length === 0
          ? "No se encontraron registros de pedidos asociados a esta dirección de correo."
          : `Se encontraron ${sanitizedOrders.length} pedido(s) asociados a su correo.`
      });
    }

    if (action === "delete") {
      const anonymizedEmail = `anonymized_${crypto.randomUUID()}@vault.invalid`;

      const result = await prisma.order.updateMany({
        where: { customerEmail: email },
        data: { customerEmail: anonymizedEmail },
      });

      return NextResponse.json({
        success: true,
        message: "Datos personales anonimizados con éxito conforme al derecho de supresión / olvido.",
        recordsAffected: result.count,
      });
    }

    return NextResponse.json({ error: "Solicitud no procesada." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API POST /api/privacy/request Error]:", err);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de privacidad." },
      { status: 500 }
    );
  }
}
