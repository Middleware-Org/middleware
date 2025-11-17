/* **************************************************
 * Imports
 **************************************************/
import { getFileContent, listDirectoryFiles } from "./client";
import type { Category } from "./types";

/* **************************************************
 * Categories
 ************************************************** */
export async function getAllCategories(): Promise<Category[]> {
  const files = await listDirectoryFiles("content/categories");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const categories = await Promise.all(
    jsonFiles.map(async (file) => {
      const content = await getFileContent(file.path);
      const category = JSON.parse(content) as Category;
      category.slug = file.name.replace(".json", "");
      return category;
    }),
  );

  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  try {
    const content = await getFileContent(`content/categories/${slug}.json`);
    const category = JSON.parse(content) as Category;
    category.slug = slug;
    return category;
  } catch {
    return undefined;
  }
}

