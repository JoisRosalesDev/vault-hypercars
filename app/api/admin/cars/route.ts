import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { withTimeout } from "@/app/lib/timeout";

export const dynamic = "force-dynamic";
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
    return NextResponse.json({ error: error.message || "Failed to fetch admin hypercars" }, { status: error.status || 500 });
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

    if (!name || !brand || year === undefined || price === undefined || hp === undefined || !topSpeed || !status || image === undefined) {
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
          image: image || "",
          description: description || "",
        },
      }),
      9000
    );

    return NextResponse.json(newCar, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create hypercar record" }, { status: error.status || 500 });
  }
}
