/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllArticles } from "@/lib/github/articles";

/* **************************************************
 * GET /api/articles
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log per verificare se la richiesta viene fatta (non cache)
    console.log("[API] GET /api/articles - Richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const articles = await getAllArticles();
    
    // Aggiungi header per indicare che è una risposta fresh
    const response = NextResponse.json(articles);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch articles" },
      { status: 500 },
    );
  }
}
