import type { NextResponse } from "next/server";

type PrivateCacheOptions = {
  maxAgeSeconds: number;
  staleWhileRevalidateSeconds: number;
};

export const CACHE_PROFILES = {
  list: {
    maxAgeSeconds: 30,
    staleWhileRevalidateSeconds: 120,
  },
  detail: {
    maxAgeSeconds: 60,
    staleWhileRevalidateSeconds: 300,
  },
} as const;

export function setPrivateCacheHeaders(
  response: NextResponse,
  options: PrivateCacheOptions,
): NextResponse {
  response.headers.set(
    "Cache-Control",
    `private, max-age=${options.maxAgeSeconds}, stale-while-revalidate=${options.staleWhileRevalidateSeconds}`,
  );
  response.headers.set("Vary", "Authorization, Cookie");
  return response;
}

export function setNoStoreHeaders<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", "no-store");
  return response;
}
