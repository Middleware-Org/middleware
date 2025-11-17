/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN!;

/* **************************************************
 * GitHub Image Proxy API Route
  * 
 * This route proxies image requests to GitHub for private repositories.
 * It handles authentication server-side and streams the image to the client.
  **************************************************/
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Get file content from GitHub
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("GitHub API error", url, await res.text());
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: res.status },
      );
    }

    const file = await res.json();

    if (!("content" in file) || !("encoding" in file)) {
      return NextResponse.json(
        { error: "Unexpected GitHub response" },
        { status: 500 },
      );
    }

    if (file.encoding !== "base64") {
      return NextResponse.json(
        { error: `Unsupported encoding: ${file.encoding}` },
        { status: 500 },
      );
    }

    // Decode base64 content
    const imageBuffer = Buffer.from(file.content, "base64");

    // Determine content type from file extension or default to jpeg
    const extension = path.split(".").pop()?.toLowerCase();
    const contentType =
      extension === "png"
        ? "image/png"
        : extension === "gif"
          ? "image/gif"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg";

    // Return image with proper headers and caching
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error proxying GitHub image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

