/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const devBranch = process.env.GITHUB_DEV_BRANCH || "develop";
// Read images from dev branch to see latest changes
const readBranch = devBranch;
const token = process.env.GITHUB_TOKEN!;

/* **************************************************
 * GitHub Image Proxy API Route
 *
 * This route proxies image requests to GitHub for private repositories.
 * It handles authentication server-side and streams the image to the client.
 * Uses GitHub API raw endpoint for better performance (no base64 decoding needed).
 **************************************************/
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing 'path' query param" }, { status: 400 });
    }

    // Use GitHub API raw endpoint for direct binary response
    // Read from dev branch to see latest changes
    const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${readBranch}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.raw",
      },
      // IMPORTANTE: facciamo girare solo lato server
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("GitHub API error", res.status, await res.text());
      return new NextResponse("Image not found", { status: 404 });
    }

    // GitHub con Accept: raw restituisce direttamente i bytes
    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Determine content type from file extension
    const extension = path.split(".").pop()?.toLowerCase();
    let contentType = "image/jpeg"; // default

    switch (extension) {
      case "png":
        contentType = "image/png";
        break;
      case "gif":
        contentType = "image/gif";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "svg":
        contentType = "image/svg+xml";
        break;
      case "jpg":
      case "jpeg":
      default:
        contentType = "image/jpeg";
    }

    // Return image with proper headers and caching
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error proxying GitHub image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
