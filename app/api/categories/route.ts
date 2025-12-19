/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/github/categories";

/* **************************************************
 * GET /api/categories - With Pagination & Filtering
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
    const limit = parseInt(searchParams.get("limit") || "50"); // Categories usually fewer
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const order = searchParams.get("order") || "asc";

    console.log("[API] GET /api/categories - Paginated request", {
      timestamp: new Date().toISOString(),
      user: user.email,
      page,
      limit,
    });

    // Get all categories
    let categories = await getAllCategories();

    // Server-side filtering
    if (search) {
      const searchLower = search.toLowerCase();
      categories = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.slug.toLowerCase().includes(searchLower) ||
          (c.description && c.description.toLowerCase().includes(searchLower))
      );
    }

    // Server-side sorting
    categories.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });

    // Pagination
    const total = categories.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCategories = categories.slice(start, end);

    // Return with pagination metadata
    return NextResponse.json(
      {
        data: paginatedCategories,
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
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
