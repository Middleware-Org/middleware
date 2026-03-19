/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAllIssues } from "@/lib/github/issues";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /issues");

/* **************************************************
 * GET /api/issues
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

    const issues = await getAllIssues();

    const response = NextResponse.json(issues);
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching issues", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 },
    );
  }
}
