/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAllArticles } from "@/lib/github/articles";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /articles");

/* **************************************************
 * GET /api/articles
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.debug("GET richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const articles = await getAllArticles();

    const response = NextResponse.json(articles, { status: 200 });
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching articles", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
