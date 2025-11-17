/* **************************************************
 * Imports
 **************************************************/
import { getFileContent } from "./client";
import type { Author } from "./types";

/* **************************************************
 * Authors
 ************************************************** */
export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  try {
    const content = await getFileContent(`content/authors/${slug}.json`);
    const author = JSON.parse(content) as Author;
    author.slug = slug;
    return author;
  } catch {
    return undefined;
  }
}

