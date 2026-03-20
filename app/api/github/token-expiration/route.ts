/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { getAdminUser } from "@/lib/auth/server";
import { createLogger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";

const logger = createLogger("API /github/token-expiration");

const GITHUB_API_URL = "https://api.github.com";
const token = process.env.GITHUB_TOKEN!;

function noStoreJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });
}

/* **************************************************
 * GitHub Token Expiration API Route
 *
 * This route checks when the GitHub token will expire
 * by making a request to the GitHub API and reading
 * the github-authentication-token-expiration header.
 **************************************************/
export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`github:token-expiration:${ip}`, {
      windowMs: 60_000,
      maxRequests: 20,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const user = await getAdminUser();
    if (!user) {
      return noStoreJson({ error: "Unauthorized" }, { status: 401 });
    }

    if (!token) {
      return noStoreJson({ error: "GitHub token not configured" }, { status: 500 });
    }

    const res = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      logger.error("GitHub API error", {
        status: res.status,
        body: await res.text(),
      });
      return noStoreJson({ error: "Failed to check token expiration" }, { status: res.status });
    }

    const expirationHeader = res.headers.get("github-authentication-token-expiration");

    if (!expirationHeader) {
      return noStoreJson({
        expirationDate: null,
        daysUntilExpiration: null,
        isExpiringSoon: false,
      });
    }

    const expirationDate = new Date(expirationHeader);
    const now = new Date();
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Consider "expiring soon" if less than 2 weeks (14 days)
    const isExpiringSoon = daysUntilExpiration < 14;

    return noStoreJson({
      expirationDate: expirationDate.toISOString(),
      daysUntilExpiration,
      isExpiringSoon,
    });
  } catch (error) {
    logger.error("Error checking GitHub token expiration", error);
    return noStoreJson({ error: "Internal server error" }, { status: 500 });
  }
}
