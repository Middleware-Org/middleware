/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getPodcastBySlug } from "@/lib/github/podcasts";

/* **************************************************
 * Types
 **************************************************/
interface RouteParams {
  params: Promise<{ slug: string }>;
}

/* **************************************************
 * GET /api/podcasts/[slug]
 **************************************************/
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const podcast = await getPodcastBySlug(slug);

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error("Error fetching podcast:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch podcast" },
      { status: 500 },
    );
  }
}

