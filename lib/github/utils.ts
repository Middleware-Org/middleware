/* **************************************************
 * Imports
 **************************************************/
import { generateSlug } from "@/lib/utils/slug";

import { listDirectoryFiles } from "./client";

export { generateSlug };

/* **************************************************
 * Slug Generation Utilities
 **************************************************/

/**
 * Checks if a slug exists in a directory
 */
export async function slugExists(
  directory: string,
  slug: string,
  extension: string,
  excludeSlug?: string,
): Promise<boolean> {
  try {
    const files = await listDirectoryFiles(directory);
    const filename = `${slug}${extension}`;
    return files.some(
      (file) =>
        file.type === "file" &&
        file.name === filename &&
        (!excludeSlug || file.name !== `${excludeSlug}${extension}`),
    );
  } catch {
    return false;
  }
}

/**
 * Generates a unique slug by appending a number suffix if needed
 * @param excludeSlug - Slug da escludere dal controllo (es. slug corrente durante rename)
 */
export async function generateUniqueSlug(
  directory: string,
  baseSlug: string,
  extension: string,
  excludeSlug?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (await slugExists(directory, slug, extension, excludeSlug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
