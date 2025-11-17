/* **************************************************
 * Imports
 **************************************************/
import { categories } from "@/.velite";

/* **************************************************
 * Categories
 **************************************************/
export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
