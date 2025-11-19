/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllAuthors } from "@/lib/github/authors";

/* **************************************************
 * GET /api/authors
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log per verificare se la richiesta viene fatta (non cache)
    console.log("[API] GET /api/authors - Richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const authors = await getAllAuthors();
    
    const response = NextResponse.json(authors);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch authors" },
      { status: 500 },
    );
  }
}

