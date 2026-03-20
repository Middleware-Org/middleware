/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { apiError } from "@/lib/api/responses";
import { withAuth } from "@/lib/api/withAuth";
import { getAllPages } from "@/lib/github/pages";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /pages");

/* **************************************************
 * GET /api/pages
 **************************************************/
export const GET = withAuth(async (user) => {
  try {
    const pages = await getAllPages();

    logger.debug(`GET returning ${pages.length} pages`, {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const response = NextResponse.json(pages, { status: 200 });
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("GET error", error);
    return apiError("Failed to fetch pages");
  }
});
