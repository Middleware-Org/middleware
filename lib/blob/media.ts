/* **************************************************
 * Imports
 **************************************************/
import { put, list, del, type PutBlobResult } from "@vercel/blob";
import { getAllIssues } from "@/lib/github/issues";

/* **************************************************
 * Types
 **************************************************/
export type MediaFile = {
  name: string;
  path: string;
  url: string; // Full URL from Vercel Blob
  size?: number;
  type: "image" | "audio" | "json";
  uploadedAt?: Date;
};

/* **************************************************
 * Constants
 **************************************************/
const BLOB_PREFIX = "media"; // Prefix for all media files in blob storage

/* **************************************************
 * Helper Functions
 **************************************************/
function getFileTypeFromName(filename: string): "image" | "audio" | "json" {
  const lowerName = filename.toLowerCase();
  if (lowerName.endsWith(".mp3") || lowerName.endsWith(".wav")) {
    return "audio";
  }
  if (lowerName.endsWith(".json")) {
    return "json";
  }
  return "image";
}

function generateFilename(
  filename?: string,
  fileType: "image" | "audio" | "json" = "image",
): string {
  if (!filename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extensions = {
      image: "jpg",
      audio: "mp3",
      json: "json",
    };
    return `file-${timestamp}-${random}.${extensions[fileType]}`;
  }

  // Ensure filename has correct extension based on file type
  const extensions = {
    image: /\.(jpg|jpeg|png|gif|webp)$/i,
    audio: /\.(mp3|wav)$/i,
    json: /\.json$/i,
  };

  if (!filename.match(extensions[fileType])) {
    const defaultExt = {
      image: "jpg",
      audio: "mp3",
      json: "json",
    };
    filename = `${filename}.${defaultExt[fileType]}`;
  }

  return filename;
}

function base64ToBuffer(base64: string): Buffer {
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  return Buffer.from(base64Data, "base64");
}

function getContentType(fileType: "image" | "audio" | "json", filename: string): string {
  if (fileType === "json") {
    return "application/json";
  }
  if (fileType === "audio") {
    if (filename.endsWith(".mp3")) return "audio/mpeg";
    if (filename.endsWith(".wav")) return "audio/wav";
    return "audio/mpeg";
  }
  // Image types
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".gif")) return "image/gif";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/* **************************************************
 * Media Files Operations
 **************************************************/
export async function getAllMediaFiles(): Promise<MediaFile[]> {
  try {
    const { blobs } = await list({
      prefix: `${BLOB_PREFIX}/`,
    });

    return blobs
      .filter((blob) => {
        const name = blob.pathname.split("/").pop() || "";
        return (
          name.endsWith(".jpg") ||
          name.endsWith(".jpeg") ||
          name.endsWith(".png") ||
          name.endsWith(".gif") ||
          name.endsWith(".webp") ||
          name.endsWith(".mp3") ||
          name.endsWith(".wav") ||
          name.endsWith(".json")
        );
      })
      .map((blob) => {
        const name = blob.pathname.split("/").pop() || blob.pathname;
        const fileType = getFileTypeFromName(name);

        return {
          name,
          path: blob.pathname,
          url: blob.url,
          size: blob.size,
          type: fileType,
          uploadedAt: blob.uploadedAt,
        };
      });
  } catch (error) {
    console.error("Error fetching media files from Vercel Blob:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fetch media files");
  }
}

export async function deleteMediaFile(filename: string): Promise<void> {
  // Verifica se l'immagine è usata in qualche issue
  const issues = await getAllIssues();
  const issuesUsingImage = issues.filter((issue) => {
    const coverPath = issue.cover;
    if (!coverPath) return false;

    // Extract filename from URL if it's a full URL (Vercel Blob)
    // or use the path directly if it's a relative path (GitHub legacy)
    let coverFilename: string;
    if (coverPath.startsWith("http://") || coverPath.startsWith("https://")) {
      // Extract filename from URL (e.g., "https://.../media/filename.jpg" -> "filename.jpg")
      const urlParts = coverPath.split("/");
      coverFilename = urlParts[urlParts.length - 1] || "";
    } else {
      // Legacy GitHub path (e.g., "/assets/filename.jpg" or "public/assets/filename.jpg")
      const pathParts = coverPath.split("/");
      coverFilename = pathParts[pathParts.length - 1] || "";
    }

    // Check if the cover filename matches the file we're trying to delete
    return coverFilename === filename;
  });

  if (issuesUsingImage.length > 0) {
    const issueTitles = issuesUsingImage.map((i) => i.title).join(", ");
    throw new Error(
      `Cannot delete file "${filename}" because it is used by ${issuesUsingImage.length} issue(s): ${issueTitles}`,
    );
  }

  try {
    // Find the blob by prefix and filename
    const { blobs } = await list({
      prefix: `${BLOB_PREFIX}/`,
    });

    const blobToDelete = blobs.find((blob) => {
      const name = blob.pathname.split("/").pop() || "";
      return name === filename;
    });

    if (!blobToDelete) {
      throw new Error(`File "${filename}" not found`);
    }

    await del(blobToDelete.url);
  } catch (error) {
    console.error("Error deleting media file from Vercel Blob:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete media file");
  }
}

export async function uploadMediaFile(
  fileBase64: string,
  filename?: string,
  fileType: "image" | "audio" | "json" = "image",
): Promise<string> {
  try {
    const finalFilename = generateFilename(filename, fileType);
    const buffer = base64ToBuffer(fileBase64);
    const contentType = getContentType(fileType, finalFilename);
    const blobPath = `${BLOB_PREFIX}/${finalFilename}`;

    const blob: PutBlobResult = await put(blobPath, buffer, {
      contentType,
      access: "public", // Make files publicly accessible
    });

    // Return the full URL
    return blob.url;
  } catch (error) {
    console.error("Error uploading media file to Vercel Blob:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to upload media file");
  }
}
