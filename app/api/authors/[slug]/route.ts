/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAuthorBySlug } from "@/lib/github/authors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /authors/[slug]");

/* **************************************************
 * GET /api/authors/[slug]
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

    const author = await getAuthorBySlug(slug);

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const response = NextResponse.json(author);
    setPrivateCacheHeaders(response, CACHE_PROFILES.detail);

    return response;
  } catch (error) {
    logger.error("Error fetching author", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch author" },
      { status: 500 },
    );
  }
}
