/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getCategoryBySlug } from "@/lib/github/categories";

/* **************************************************
 * GET /api/categories/[slug]
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
    console.log("[API] GET /api/categories/[slug] - Richiesta REST effettuata", {
      slug,
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const response = NextResponse.json(category);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch category" },
      { status: 500 },
    );
  }
}
