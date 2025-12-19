/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { getAllArticles } from "@/lib/github/articles";

/* **************************************************
 * GET /api/articles - With Pagination & Filtering
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
    const category = searchParams.get("category") || "";
    const author = searchParams.get("author") || "";
    const issue = searchParams.get("issue") || "";
    const published = searchParams.get("published");
    const sortBy = searchParams.get("sortBy") || "date";
    const order = searchParams.get("order") || "desc";

    console.log("[API] GET /api/articles - Paginated request", {
      timestamp: new Date().toISOString(),
      user: user.email,
      page,
      limit,
      search,
    });

    // Get all articles
    let articles = await getAllArticles();

    // Server-side filtering
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.excerpt.toLowerCase().includes(searchLower) ||
          a.slug.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      articles = articles.filter((a) => a.category === category);
    }

    if (author) {
      articles = articles.filter((a) => a.author === author);
    }

    if (issue) {
      articles = articles.filter((a) => a.issue === issue);
    }

    if (published !== null && published !== undefined && published !== "") {
      const isPublished = published === "true";
      articles = articles.filter((a) => a.published === isPublished);
    }

    // Server-side sorting
    articles.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });

    // Pagination
    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedArticles = articles.slice(start, end);

    // Return with pagination metadata
    const response = NextResponse.json(
      {
        data: paginatedArticles,
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

    return response;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
