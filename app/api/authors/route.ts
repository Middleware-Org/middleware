/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAllAuthors } from "@/lib/github/authors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /authors");

/* **************************************************
 * GET /api/authors
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

    const authors = await getAllAuthors();

    const response = NextResponse.json(authors, { status: 200 });
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching authors", error);
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}
