import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  return null;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin_cars_put" });
  if (rateLimitError) return rateLimitError;

  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const updatedCar = await withTimeout(
      prisma.hypercar.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.brand !== undefined && { brand: body.brand }),
          ...(body.year !== undefined && { year: Number(body.year) }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.hp !== undefined && { hp: Number(body.hp) }),
          ...(body.topSpeed !== undefined && { topSpeed: body.topSpeed }),
          ...(body.acceleration !== undefined && { acceleration: body.acceleration }),
          ...(body.engine !== undefined && { engine: body.engine }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.stock !== undefined && { stock: Number(body.stock) }),
          ...(body.image !== undefined && { image: body.image }),
          ...(body.description !== undefined && { description: body.description }),
        },
      }),
      9000
    );

    return NextResponse.json(updatedCar, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json({ error: err.message || "Failed to update hypercar record" }, { status: err.status || 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, { limit: 30, windowMs: 60 * 1000, keyPrefix: "admin_cars_delete" });
  if (rateLimitError) return rateLimitError;

  try {
    const params = await context.params;
    const { id } = params;

    await withTimeout(
      prisma.hypercar.delete({
        where: { id },
      }),
      9000
    );

    return NextResponse.json({ success: true, message: `Hypercar ${id} deleted successfully` }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json({ error: err.message || "Failed to delete hypercar record" }, { status: err.status || 500 });
  }
}
