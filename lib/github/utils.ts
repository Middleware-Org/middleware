/* **************************************************
 * Imports
 **************************************************/
import { listDirectoryFiles } from "./client";

/* **************************************************
 * Slug Generation Utilities
 **************************************************/

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize to decomposed form for handling accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Checks if a slug exists in a directory
 */
export async function slugExists(
  directory: string,
  slug: string,
  extension: string,
): Promise<boolean> {
  try {
    const files = await listDirectoryFiles(directory);
    const filename = `${slug}${extension}`;
    return files.some((file) => file.type === "file" && file.name === filename);
  } catch {
    return false;
  }
}

/**
 * Generates a unique slug by appending a number suffix if needed
 */
export async function generateUniqueSlug(
  directory: string,
  baseSlug: string,
  extension: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (await slugExists(directory, slug, extension)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
