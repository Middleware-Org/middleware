/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { uploadMediaFile } from "@/lib/github/media";

/* **************************************************
 * Media Upload API Route
 **************************************************/
export async function POST(request: NextRequest) {
  try {
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
      // Convert File to base64
      const arrayBuffer = await fileInput.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = fileInput.type || "image/jpeg";
      fileBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } else {
      // Already a base64 string
      fileBase64 = fileInput as string;
    }

    const filePath = await uploadMediaFile(
      fileBase64,
      filename?.trim() || undefined,
      fileType,
    );

    return NextResponse.json({ success: true, data: filePath, message: "File uploaded successfully" });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 },
    );
  }
}

// Note: For Next.js App Router API routes, body size limits are handled by the runtime
// The default limit is typically 4.5MB, but can be increased via environment variables
// or by using streaming for very large files

