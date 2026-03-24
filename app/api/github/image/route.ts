/* **************************************************
 * Imports
 **************************************************/
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/server";
import { fetchWithTimeout } from "@/lib/github/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /github/image");

const GITHUB_API_URL = "https://api.github.com";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const devBranch = process.env.GITHUB_DEV_BRANCH || "develop";
// Read images from dev branch to see latest changes
const readBranch = devBranch;
const token = process.env.GITHUB_TOKEN!;

const PUBLIC_IMAGE_PREFIX = "public/assets/";
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"]);

function sanitizePath(rawPath: string): string {
  const trimmed = rawPath.trim().replace(/^\/+/, "");

  if (!trimmed) {
    throw new Error("Invalid path");
  }

  if (trimmed.includes("..") || trimmed.includes("\\") || /[\x00-\x1F\x7F]/.test(trimmed)) {
    throw new Error("Invalid path");
  }

  return trimmed;
}

function isAllowedImagePath(path: string): boolean {
  if (!path.startsWith(PUBLIC_IMAGE_PREFIX)) {
    return false;
  }

  const extension = path.split(".").pop()?.toLowerCase();
  if (!extension) {
    return false;
  }

  return ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

function encodeGitHubPath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/* **************************************************
 * GitHub Image Proxy API Route
 *
 * This route proxies image requests to GitHub for private repositories.
 * It handles authentication server-side and streams the image to the client.
 * Uses GitHub API raw endpoint for better performance (no base64 decoding needed).
 **************************************************/
export async function GET(request: NextRequest) {
  try {
    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "GitHub configuration missing" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const rawPath = searchParams.get("path");

    if (!rawPath) {
      return NextResponse.json({ error: "Missing 'path' query param" }, { status: 400 });
    }

    const path = sanitizePath(rawPath);
    const isAllowedPublicAsset = isAllowedImagePath(path);

    if (!isAllowedPublicAsset) {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
    }

    // Use GitHub API raw endpoint for direct binary response
    // Read from dev branch to see latest changes
    const encodedPath = encodeGitHubPath(path);
    const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${readBranch}`;

    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.raw",
      },
      // IMPORTANTE: facciamo girare solo lato server
      cache: "no-store",
    });

    if (!res.ok) {
      logger.error("GitHub API error", { status: res.status });
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
      case "avif":
        contentType = "image/avif";
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
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    logger.error("Error proxying GitHub image", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
