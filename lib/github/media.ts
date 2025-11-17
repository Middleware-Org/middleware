/* **************************************************
 * Imports
 **************************************************/
import { deleteFile, listDirectoryFiles, uploadImage } from "./client";
import { getAllIssues } from "./issues";
import type { GitHubFile } from "./types";

/* **************************************************
 * Types
 **************************************************/
export type MediaFile = {
  name: string;
  path: string;
  url: string; // Relative path like "/assets/filename.jpg"
  size?: number;
  type?: string;
};

/* **************************************************
 * Media Files
 **************************************************/
export async function getAllMediaFiles(): Promise<MediaFile[]> {
  const files = await listDirectoryFiles("public/assets");
  const imageFiles = files.filter(
    (f) =>
      f.type === "file" &&
      (f.name.endsWith(".jpg") ||
        f.name.endsWith(".jpeg") ||
        f.name.endsWith(".png") ||
        f.name.endsWith(".gif") ||
        f.name.endsWith(".webp")),
  );

  return imageFiles.map((file) => ({
    name: file.name,
    path: file.path,
    url: `/assets/${file.name}`,
    size: 0, // GitHub API doesn't provide size directly
    type: "image",
  }));
}

export async function deleteMediaFile(filename: string): Promise<void> {
  // Verifica se l'immagine è usata in qualche issue
  const issues = await getAllIssues();
  const issuesUsingImage = issues.filter((issue) => {
    // Extract filename from cover path (could be "/assets/filename.jpg" or "public/assets/filename.jpg")
    const coverPath = issue.cover;
    if (!coverPath) return false;
    
    // Normalize path: remove leading slash, ensure it starts with "public/assets/"
    const normalizedPath = coverPath.startsWith("/")
      ? coverPath.slice(1)
      : coverPath;
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
  imageBase64: string,
  filename?: string,
): Promise<string> {
  return uploadImage(imageBase64, filename);
}

