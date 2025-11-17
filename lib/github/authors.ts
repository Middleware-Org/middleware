/* **************************************************
 * Imports
 **************************************************/
import { getFileContent, listDirectoryFiles } from "./client";
import type { Author } from "./types";

/* **************************************************
 * Authors
 ************************************************** */
export async function getAllAuthors(): Promise<Author[]> {
  const files = await listDirectoryFiles("content/authors");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const authors = await Promise.all(
    jsonFiles.map(async (file) => {
      const content = await getFileContent(file.path);
      const author = JSON.parse(content) as Author;
      author.slug = file.name.replace(".json", "");
      return author;
    }),
  );

  return authors;
}

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

