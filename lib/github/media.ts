/* **************************************************
 * Imports
 **************************************************/
import { deleteFile, listDirectoryFiles } from "./client";
import { getAllIssues } from "./issues";

/* **************************************************
 * Types
 **************************************************/
export type MediaFile = {
  name: string;
  path: string;
  url: string; // Relative path like "/assets/filename.jpg"
  size?: number;
  type: "image" | "audio" | "json";
};

/* **************************************************
 * Media Files
 **************************************************/
export async function getAllMediaFiles(): Promise<MediaFile[]> {
  const files = await listDirectoryFiles("public/assets");
  const mediaFiles = files.filter(
    (f) =>
      f.type === "file" &&
      (f.name.endsWith(".jpg") ||
        f.name.endsWith(".jpeg") ||
        f.name.endsWith(".png") ||
        f.name.endsWith(".gif") ||
        f.name.endsWith(".webp") ||
        f.name.endsWith(".mp3") ||
        f.name.endsWith(".wav") ||
        f.name.endsWith(".json")),
  );

  return mediaFiles.map((file) => {
    let fileType: "image" | "audio" | "json" = "image";
    if (file.name.endsWith(".mp3") || file.name.endsWith(".wav")) {
      fileType = "audio";
    } else if (file.name.endsWith(".json")) {
      fileType = "json";
    }

    return {
      name: file.name,
      path: file.path,
      url: `/assets/${file.name}`,
      size: 0, // GitHub API doesn't provide size directly
      type: fileType,
    };
  });
}

export async function deleteMediaFile(filename: string): Promise<void> {
  // Verifica se l'immagine è usata in qualche issue
  const issues = await getAllIssues();
  const issuesUsingImage = issues.filter((issue) => {
    // Extract filename from cover path (could be "/assets/filename.jpg" or "public/assets/filename.jpg")
    const coverPath = issue.cover;
    if (!coverPath) return false;

    // Normalize path: remove leading slash, ensure it starts with "public/assets/"
    const normalizedPath = coverPath.startsWith("/") ? coverPath.slice(1) : coverPath;
    const fullPath = normalizedPath.startsWith("public/")
      ? normalizedPath
      : `public/${normalizedPath}`;

    // Check if this issue uses the image we're trying to delete
    return fullPath === `public/assets/${filename}`;
  });

  if (issuesUsingImage.length > 0) {
    const issueTitles = issuesUsingImage.map((i) => i.title).join(", ");
    throw new Error(
      `Cannot delete image "${filename}" because it is used by ${issuesUsingImage.length} issue(s): ${issueTitles}`,
    );
  }

  // Se non ci sono issue che usano l'immagine, procedi con l'eliminazione
  const filePath = `public/assets/${filename}`;
  await deleteFile(filePath, `Delete media file: ${filename}`);
}

export async function uploadMediaFile(
  fileBase64: string,
  filename?: string,
  fileType: "image" | "audio" | "json" = "image",
): Promise<string> {
  const { uploadFile } = await import("./client");
  return uploadFile(fileBase64, filename, fileType);
}
