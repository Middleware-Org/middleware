/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllPodcasts } from "@/lib/github/podcasts";

/* **************************************************
 * GET /api/podcasts
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[API] GET /api/podcasts - Richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const podcasts = await getAllPodcasts();

    const response = NextResponse.json(podcasts);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());

    return response;
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch podcasts" },
      { status: 500 },
    );
  }
}
