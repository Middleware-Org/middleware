/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getPodcastBySlug } from "@/lib/github/podcasts";

/* **************************************************
 * GET /api/podcasts/[slug]
 **************************************************/
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    console.log("[API] GET /api/podcasts/[slug] - Richiesta REST effettuata", {
      slug,
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const podcast = await getPodcastBySlug(slug);

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    const response = NextResponse.json(podcast);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());

    return response;
  } catch (error) {
    console.error("Error fetching podcast:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch podcast" },
      { status: 500 },
    );
  }
}
