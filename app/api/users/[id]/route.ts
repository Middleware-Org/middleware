/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getUserById } from "@/lib/github/users";

/* **************************************************
 * GET /api/users/[id]
 **************************************************/
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Log per verificare se la richiesta viene fatta (non cache)
    console.log("[API] GET /api/users/[id] - Richiesta REST effettuata", {
      id,
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const userData = await getUserById(id);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json(userData);
    response.headers.set("X-Data-Source", "rest-api");
    response.headers.set("X-Timestamp", new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user" },
      { status: 500 },
    );
  }
}

