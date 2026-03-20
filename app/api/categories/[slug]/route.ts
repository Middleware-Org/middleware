/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getCategoryBySlug } from "@/lib/github/categories";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /categories/[slug]");

/* **************************************************
 * GET /api/categories/[slug]
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

    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const response = NextResponse.json(category);
    setPrivateCacheHeaders(response, CACHE_PROFILES.detail);

    return response;
  } catch (error) {
    logger.error("Error fetching category", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch category" },
      { status: 500 },
    );
  }
}
