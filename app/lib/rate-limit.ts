import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Allow process termination in Node environment without hanging on timer
  if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    (cleanupInterval as any).unref();
  }
}

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
