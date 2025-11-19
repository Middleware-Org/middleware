/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getArticleBySlug } from "@/lib/github/articles";

/* **************************************************
 * GET /api/articles/[slug]
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
    
    // Log per verificare se la richiesta viene fatta (non cache)
    console.log("[API] GET /api/articles/[slug] - Richiesta REST effettuata", {
      slug,
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const response = NextResponse.json(article);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch article" },
      { status: 500 },
    );
  }
}

