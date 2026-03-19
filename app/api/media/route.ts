/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAllMediaFiles } from "@/lib/github/media";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /media");

/* **************************************************
 * GET /api/media
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

    const mediaFiles = await getAllMediaFiles();

    const response = NextResponse.json(mediaFiles);
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching media files", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch media files" },
      { status: 500 },
    );
  }
}
