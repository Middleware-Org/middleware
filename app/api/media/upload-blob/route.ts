/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getUser } from "@/lib/auth/server";

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
        // Extract filename from pathname (should be "media/filename.ext")
        const filename = pathname.replace("media/", "");

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
          addRandomSuffix: false,
          pathname: pathname, // Use the pathname provided by the client
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate upload URL",
      },
      { status: 500 },
    );
  }
}
