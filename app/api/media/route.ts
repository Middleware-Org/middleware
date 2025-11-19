/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllMediaFiles } from "@/lib/github/media";

/* **************************************************
 * GET /api/media
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log per verificare se la richiesta viene fatta (non cache)
    console.log("[API] GET /api/media - Richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const mediaFiles = await getAllMediaFiles();
    
    const response = NextResponse.json(mediaFiles);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching media files:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch media files" },
      { status: 500 },
    );
  }
}
