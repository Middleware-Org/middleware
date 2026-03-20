/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getArticleBySlug } from "@/lib/github/articles";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /articles/[slug]");

/* **************************************************
 * GET /api/articles/[slug]
 **************************************************/
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    logger.debug("GET richiesta REST effettuata", {
      slug,
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const response = NextResponse.json(article, { status: 200 });
    setPrivateCacheHeaders(response, CACHE_PROFILES.detail);

    return response;
  } catch (error) {
    logger.error("Error fetching article", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}
