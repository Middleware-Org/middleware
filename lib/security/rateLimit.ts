import { NextResponse } from "next/server";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const RATE_LIMIT_STORE_SYMBOL = Symbol.for("middleware.rateLimitStore");

function getRateLimitStore(): Map<string, Bucket> {
  const globalWithStore = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_SYMBOL]?: Map<string, Bucket>;
  };

  if (!globalWithStore[RATE_LIMIT_STORE_SYMBOL]) {
    globalWithStore[RATE_LIMIT_STORE_SYMBOL] = new Map<string, Bucket>();
  }

  return globalWithStore[RATE_LIMIT_STORE_SYMBOL];
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getRateLimitStore();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (existing.count >= options.maxRequests) {
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - existing.count,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function createRateLimitResponse(result: RateLimitResult) {
  const response = NextResponse.json({ error: "Too many requests" }, { status: 429 });
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  return response;
}
