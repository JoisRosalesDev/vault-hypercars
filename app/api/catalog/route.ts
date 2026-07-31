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

    // 2. Fetch inventory with 9s query timeout
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
