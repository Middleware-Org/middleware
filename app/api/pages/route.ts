/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getAllPages } from "@/lib/github/pages";
import { withAuth } from "@/lib/api/withAuth";
import { apiError } from "@/lib/api/responses";
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

    const response = NextResponse.json(pages);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());

    return response;
  } catch (error) {
    logger.error("GET error", error);
    return apiError("Failed to fetch pages");
  }
});
