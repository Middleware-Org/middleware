/* **************************************************
 * Imports
 **************************************************/
import { categories } from "@/.velite";

/* **************************************************
 * Categories
 **************************************************/
export const getAllCategories = () => categories;

export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export const getCategoryById = (id: string) => categories.find((c) => c.id === id);
