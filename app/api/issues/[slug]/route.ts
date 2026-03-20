/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getIssueBySlug } from "@/lib/github/issues";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /issues/[slug]");

/* **************************************************
 * GET /api/issues/[slug]
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

    const issue = await getIssueBySlug(slug);

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const response = NextResponse.json(issue);
    setPrivateCacheHeaders(response, CACHE_PROFILES.detail);

    return response;
  } catch (error) {
    logger.error("Error fetching issue", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issue" },
      { status: 500 },
    );
  }
}
