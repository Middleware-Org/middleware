/* **************************************************
 * Imports
 **************************************************/
import { getFileContent } from "./client";
import type { Category } from "./types";

/* **************************************************
 * Categories
 ************************************************** */
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

