/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getAllPages } from "@/lib/github/pages";
import { withAdminAuth } from "@/lib/api/withAdminAuth";

/* **************************************************
 * GET /api/pages
 **************************************************/
export const GET = withAdminAuth(async (user) => {
  try {
    const pages = await getAllPages();

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] GET /api/pages - Returning ${pages.length} pages`, {
        timestamp: new Date().toISOString(),
        user: user.email,
      });
    }

    const response = NextResponse.json(pages);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());

    return response;
  } catch (error) {
    console.error("[API] GET /api/pages - Error:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
});
