/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getPageBySlug } from "@/lib/github/pages";
import { withAuth } from "@/lib/api/withAuth";
import { apiError } from "@/lib/api/responses";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /pages/[slug]");

/* **************************************************
 * GET /api/pages/[slug]
 **************************************************/
export const GET = withAuth(
  async (_user, _request: Request, { params }: { params: Promise<{ slug: string }> }) => {
    try {
      const { slug } = await params;
      const page = await getPageBySlug(slug);

      logger.debug(`GET ${slug}`, {
        found: !!page,
        timestamp: new Date().toISOString(),
      });

      if (!page) {
        return apiError("Page not found", 404);
      }

      const response = NextResponse.json(page);
      response.headers.set("X-Data-Source", "rest-api");
      response.headers.set("X-Timestamp", new Date().toISOString());

      return response;
    } catch (error) {
      logger.error("GET error", error);
      return apiError("Failed to fetch page");
    }
  },
);
