/* **************************************************
 * Page Service - Cache-aware con Next.js
 ************************************************** */

import type { Page } from "@/lib/github/types";
import {
  getAllPages as getPagesFromGitHub,
  getPageBySlug as getPageFromGitHub,
} from "@/lib/github/pages";

/**
 * Cache tags per invalidazione granulare
 */
export const PAGE_CACHE_TAGS = {
  all: "pages",
  bySlug: (slug: string) => `page-${slug}`,
} as const;

/**
 * Page Service
 */
export class PageService {
  /**
   * Recupera tutte le pagine
   */
  static async getAll(): Promise<Page[]> {
    return await getPagesFromGitHub();
  }

  /**
   * Recupera una singola pagina per slug
   */
  static async getBySlug(slug: string): Promise<Page | undefined> {
    return await getPageFromGitHub(slug);
  }
}
