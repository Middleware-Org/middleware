/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getPageBySlug } from "@/lib/github/pages";
import { withAdminAuth } from "@/lib/api/withAdminAuth";
import { apiError } from "@/lib/api/responses";

/* **************************************************
 * GET /api/pages/[slug]
 **************************************************/
export const GET = withAdminAuth(
  async (_user, _request: Request, { params }: { params: Promise<{ slug: string }> }) => {
    try {
      const { slug } = await params;
      const page = await getPageBySlug(slug);

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] GET /api/pages/${slug}`, {
          found: !!page,
          timestamp: new Date().toISOString(),
        });
      }

      if (!page) {
        return apiError("Page not found", 404);
      }

      const response = NextResponse.json(page);
      response.headers.set("X-Data-Source", "rest-api");
      response.headers.set("X-Timestamp", new Date().toISOString());

      return response;
    } catch (error) {
      console.error(`[API] GET /api/pages/[slug] - Error:`, error);
      return apiError("Failed to fetch page");
    }
  },
);
