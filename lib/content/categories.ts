/* **************************************************
 * Imports
 **************************************************/
import { categories } from "@/.velite";

const safeCategories = Array.isArray(categories) ? categories : [];

/* **************************************************
 * Categories
 **************************************************/
export const getAllCategories = () => safeCategories;

export const getCategoryBySlug = (slug: string) => safeCategories.find((c) => c.slug === slug);

export const getCategoryById = (id: string) => safeCategories.find((c) => c.id === id);
