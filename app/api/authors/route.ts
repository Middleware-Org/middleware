/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllAuthors } from "@/lib/github/authors";

/* **************************************************
 * GET /api/authors - With Pagination & Filtering
 **************************************************/
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50"); // Authors usually fewer
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const order = searchParams.get("order") || "asc";

    console.log("[API] GET /api/authors - Paginated request", {
      timestamp: new Date().toISOString(),
      user: user.email,
      page,
      limit,
    });

    // Get all authors
    let authors = await getAllAuthors();

    // Server-side filtering
    if (search) {
      const searchLower = search.toLowerCase();
      authors = authors.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.slug.toLowerCase().includes(searchLower) ||
          (a.description && a.description.toLowerCase().includes(searchLower))
      );
    }

    // Server-side sorting
    authors.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });

    // Pagination
    const total = authors.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedAuthors = authors.slice(start, end);

    // Return with pagination metadata
    return NextResponse.json(
      {
        data: paginatedAuthors,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: end < total,
          hasPrevPage: page > 1,
        },
      },
      {
        headers: {
          "X-Data-Source": "rest-api-paginated",
          "X-Timestamp": new Date().toISOString(),
          "Cache-Control": "private, s-maxage=120, stale-while-revalidate=240",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
