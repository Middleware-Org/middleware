/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getPageBySlug } from "@/lib/github/pages";

/* **************************************************
 * GET /api/pages/[slug]
 **************************************************/
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const response = NextResponse.json(page);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());

    return response;
  } catch (error) {
    console.error(`[API] GET /api/pages/[slug] - Error:`, error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
