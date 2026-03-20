/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAllPodcasts } from "@/lib/github/podcasts";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /podcasts");

/* **************************************************
 * GET /api/podcasts
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const podcasts = await getAllPodcasts();

    const response = NextResponse.json(podcasts, { status: 200 });
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching podcasts", error);
    return NextResponse.json({ error: "Failed to fetch podcasts" }, { status: 500 });
  }
}
