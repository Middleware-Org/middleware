/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { CACHE_PROFILES, setPrivateCacheHeaders } from "@/lib/api/cache";
import { getUser } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/github/categories";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /categories");

/* **************************************************
 * GET /api/categories
 **************************************************/
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.debug("GET richiesta REST effettuata", {
      timestamp: new Date().toISOString(),
      user: user.email,
    });

    const categories = await getAllCategories();

    const response = NextResponse.json(categories, { status: 200 });
    setPrivateCacheHeaders(response, CACHE_PROFILES.list);

    return response;
  } catch (error) {
    logger.error("Error fetching categories", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
