/* **************************************************
 * Category Service - Cache-aware con Next.js
 ************************************************** */

import type { Category } from "@/lib/github/types";
import {
  getAllCategories as getCategoriesFromGitHub,
  getCategoryBySlug as getCategoryFromGitHub,
} from "@/lib/github/categories";

/**
 * Cache tags per invalidazione granulare
 */
export const CATEGORY_CACHE_TAGS = {
  all: "categories",
  bySlug: (slug: string) => `category-${slug}`,
} as const;

/**
 * Category Service
 */
export class CategoryService {
  /**
   * Recupera tutte le categorie
   */
  static async getAll(): Promise<Category[]> {
    return await getCategoriesFromGitHub();
  }

  /**
   * Recupera una singola categoria per slug
   */
  static async getBySlug(slug: string): Promise<Category | undefined> {
    return await getCategoryFromGitHub(slug);
  }
}
