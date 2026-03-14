/* **************************************************
 * Imports
 **************************************************/
import { auth } from "@/lib/auth/server";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

/* **************************************************
 * Auth API Route
 **************************************************/
const authHandler = toNextJsHandler(auth);

export const GET = authHandler.GET;

export async function POST(request: Request) {
  const pathname = new URL(request.url).pathname;
  const ip = getClientIp(request);

  const isSignIn = pathname.includes("/sign-in");
  const limit = await checkRateLimit(`auth:${ip}:${isSignIn ? "sign-in" : "post"}`, {
    windowMs: 60_000,
    maxRequests: isSignIn ? 5 : 20,
  });

  if (!limit.allowed) {
    return createRateLimitResponse(limit);
  }

  if (pathname.includes("/sign-up")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return authHandler.POST(request);
}
