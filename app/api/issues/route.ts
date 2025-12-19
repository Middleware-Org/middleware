/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllIssues } from "@/lib/github/issues";

/* **************************************************
 * GET /api/issues - With Pagination & Filtering
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const published = searchParams.get("published");
    const sortBy = searchParams.get("sortBy") || "date";
    const order = searchParams.get("order") || "desc";

    console.log("[API] GET /api/issues - Paginated request", {
      timestamp: new Date().toISOString(),
      user: user.email,
      page,
      limit,
    });

    // Get all issues
    let issues = await getAllIssues();

    // Server-side filtering
    if (search) {
      const searchLower = search.toLowerCase();
      issues = issues.filter(
        (i) =>
          i.title.toLowerCase().includes(searchLower) ||
          i.slug.toLowerCase().includes(searchLower) ||
          (i.description && i.description.toLowerCase().includes(searchLower))
      );
    }

    if (published !== null && published !== undefined && published !== "") {
      const isPublished = published === "true";
      issues = issues.filter((i) => i.published === isPublished);
    }

    // Server-side sorting
    issues.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });

    // Pagination
    const total = issues.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedIssues = issues.slice(start, end);

    // Return with pagination metadata
    return NextResponse.json(
      {
        data: paginatedIssues,
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
          "Cache-Control": "private, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
