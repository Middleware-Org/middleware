/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAuthorBySlug } from "@/lib/github/authors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /authors/[slug]");

/* **************************************************
 * GET /api/authors/[slug]
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

    const author = await getAuthorBySlug(slug);

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const response = NextResponse.json(author);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());

    return response;
  } catch (error) {
    logger.error("Error fetching author", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch author" },
      { status: 500 },
    );
  }
}
