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

export async function GET(req: NextRequest) {
  const authError = await verifyAdminAuth();
  if (authError) return authError;

  const rateLimitError = checkRateLimit(req, {
    limit: 30,
    windowMs: 60 * 1000,
    keyPrefix: "admin_analytics_get",
  });
  if (rateLimitError) return rateLimitError;

  try {
    const analytics = await withTimeout(
      (async () => {
        // Fetch active cars for inventory and unit metrics
        const activeCars = await prisma.hypercar.findMany({
          where: {
            stock: { gt: 0 },
          },
          select: {
            price: true,
            stock: true,
          },
        });

        const totalInventoryUSD = activeCars.reduce(
          (acc, car) => acc + car.price * car.stock,
          0
        );

        const activeUnitsCount = activeCars.reduce(
          (acc, car) => acc + car.stock,
          0
        );

        // Calculate monthly revenue for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const completedOrdersThisMonth = await prisma.order.findMany({
          where: {
            status: "COMPLETED",
            createdAt: { gte: startOfMonth },
          },
          select: {
            totalAmount: true,
          },
        });

        const monthlyRevenueUSD = completedOrdersThisMonth.reduce(
          (acc, order) => acc + order.totalAmount,
          0
        );

        // Calculate conversion rate: (completedOrders / totalOrders) * 100
        const totalOrdersCount = await prisma.order.count();
        const completedOrdersCount = await prisma.order.count({
          where: { status: "COMPLETED" },
        });

        const conversionRate =
          totalOrdersCount > 0
            ? Number(((completedOrdersCount / totalOrdersCount) * 100).toFixed(1))
            : 0;

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

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error("[API GET /api/admin/analytics Error]:", error);
    return NextResponse.json(
      { error: err.message || "Failed to compute dashboard analytics" },
      { status: err.status || 500 }
    );
  }
}
