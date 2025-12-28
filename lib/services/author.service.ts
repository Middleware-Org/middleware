/* **************************************************
 * Author Service - Cache-aware con Next.js
 ************************************************** */

import type { Author } from "@/lib/github/types";
import {
  getAllAuthors as getAuthorsFromGitHub,
  getAuthorBySlug as getAuthorFromGitHub,
} from "@/lib/github/authors";

/**
 * Cache tags per invalidazione granulare
 */
export const AUTHOR_CACHE_TAGS = {
  all: "authors",
  bySlug: (slug: string) => `author-${slug}`,
} as const;

/**
 * Author Service
 */
export class AuthorService {
  /**
   * Recupera tutti gli autori
   */
  static async getAll(): Promise<Author[]> {
    return await getAuthorsFromGitHub();
  }

  /**
   * Recupera un singolo autore per slug
   */
  static async getBySlug(slug: string): Promise<Author | undefined> {
    return await getAuthorFromGitHub(slug);
  }
}
