/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { uploadMediaFile } from "@/lib/github/media";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/mp3",
  "application/json",
]);

function estimateBase64SizeBytes(value: string): number {
  const base64Data = (value.includes(",") ? value.split(",")[1] : value).replace(/\s/g, "");
  const padding = base64Data.endsWith("==") ? 2 : base64Data.endsWith("=") ? 1 : 0;
  return Math.floor((base64Data.length * 3) / 4) - padding;
}

/* **************************************************
 * Media Upload API Route
 *
 * DEPRECATED: This API route has a 4.5MB payload limit on Vercel.
 * Use the Server Action `uploadMediaAction` from `app/[locale]/admin/(protected)/media/actions.ts`
 * instead, which supports up to 50MB (configured in next.config.ts).
 *
 * This route is kept for backward compatibility but should not be used for new code.
 **************************************************/
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`media:upload:${ip}`, {
      windowMs: 60_000,
      maxRequests: 10,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const fileInput = formData.get("file");
    const filename = formData.get("filename") as string | null;
    const fileType = (formData.get("fileType") as "image" | "audio" | "json") || "image";

    if (!fileInput) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Handle both File objects and base64 strings
    let fileBase64: string;
    if (fileInput instanceof File) {
      if (fileInput.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }

      if (!ALLOWED_MIME_TYPES.has(fileInput.type)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }

      // Convert File to base64
      const arrayBuffer = await fileInput.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = fileInput.type || "image/jpeg";
      fileBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } else {
      // Already a base64 string
      if (typeof fileInput !== "string") {
        return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
      }

      const mimeMatch = fileInput.match(/^data:([^;]+);base64,/);
      if (mimeMatch && !ALLOWED_MIME_TYPES.has(mimeMatch[1])) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }

      if (estimateBase64SizeBytes(fileInput) > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }

      fileBase64 = fileInput;
    }

    const filePath = await uploadMediaFile(fileBase64, filename?.trim() || undefined, fileType);

    return NextResponse.json({
      success: true,
      data: filePath,
      message: "File uploaded successfully",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
      },
      { status: 500 },
    );
  }
}

// Note: For Next.js App Router API routes, body size limits are handled by the runtime
// The default limit is typically 4.5MB on Vercel, and cannot be increased for API routes.
// For larger files, use Server Actions instead (configured to 50MB in next.config.ts).
