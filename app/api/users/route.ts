/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getAdminUser } from "@/lib/auth/server";
import { getAllUsers } from "@/lib/github/users";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /users");

/* **************************************************
 * GET /api/users
 **************************************************/
export async function GET() {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.debug("GET richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const users = await getAllUsers();

    const response = NextResponse.json(users);
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching users", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 },
    );
  }
}
