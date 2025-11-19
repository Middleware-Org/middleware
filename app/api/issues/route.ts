/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllIssues } from "@/lib/github/issues";

/* **************************************************
 * GET /api/issues
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log per verificare se la richiesta viene fatta (non cache)
    console.log("[API] GET /api/issues - Richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const issues = await getAllIssues();
    
    const response = NextResponse.json(issues);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 },
    );
  }
}
