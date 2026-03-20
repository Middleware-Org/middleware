/* **************************************************
 * Imports
 **************************************************/
import { handleUpload } from "@vercel/blob/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getUser } from "@/lib/auth/server";
import { createLogger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";

const logger = createLogger("API /media/upload-blob");
const ALLOWED_PATHNAME_REGEX = /^media\/[a-zA-Z0-9._-]{1,120}$/;
const ALLOWED_EXTENSION_REGEX = /\.(jpe?g|png|gif|webp|mp3|wav|json)$/i;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/* **************************************************
 * Direct Blob Upload API Route
 *
 * This route handles direct client-side uploads to Vercel Blob Storage.
 * It uses handleUpload from @vercel/blob/client to generate signed URLs
 * that allow the client to upload files directly without passing through
 * the serverless function, bypassing the 4.5MB/50MB payload limits.
 **************************************************/
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`media:upload-blob:${ip}`, {
      windowMs: 60_000,
      maxRequests: 20,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Generate signed URL for direct client upload
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!ALLOWED_PATHNAME_REGEX.test(pathname)) {
          throw new Error("Invalid upload path");
        }

        // Extract filename from pathname (should be "media/filename.ext")
        const filename = pathname.replace("media/", "");

        if (!ALLOWED_EXTENSION_REGEX.test(filename)) {
          throw new Error("Unsupported file extension");
        }

        // Determine file type from extension
        let fileType: "image" | "audio" | "json" = "image";
        if (filename.match(/\.(mp3|wav)$/i)) {
          fileType = "audio";
        } else if (filename.endsWith(".json")) {
          fileType = "json";
        }

        // Return configuration for the upload
        return {
          allowedContentTypes:
            fileType === "image"
              ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
              : fileType === "audio"
                ? ["audio/mpeg", "audio/wav", "audio/mp3"]
                : ["application/json"],
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: false,
          pathname: pathname, // Use the pathname provided by the client
        };
      },
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.error("Error generating upload URL", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
      },
      { status: 500 },
    );
  }
}
