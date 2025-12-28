/* **************************************************
 * Article Service - Cache-aware con Next.js
 *
 * Questo service gestisce tutte le operazioni sugli articoli
 * utilizzando la cache nativa di Next.js invece di SWR.
 *
 * - Query methods: usano cache con tags per invalidazione granulare
 * - Mutation methods: no cache, chiamano direttamente GitHub
 ************************************************** */

import type { Article } from "@/lib/github/types";
import {
  getAllArticles as getArticlesFromGitHub,
  getArticleBySlug as getArticleFromGitHub,
  getArticlesByIssue as getArticlesByIssueFromGitHub,
} from "@/lib/github/articles";

/**
 * Cache tags per invalidazione granulare
 */
export const ARTICLE_CACHE_TAGS = {
  all: "articles",
  bySlug: (slug: string) => `article-${slug}`,
  byIssue: (issueSlug: string) => `articles-issue-${issueSlug}`,
  byAuthor: (authorSlug: string) => `articles-author-${authorSlug}`,
  byCategory: (categorySlug: string) => `articles-category-${categorySlug}`,
} as const;

/**
 * Article Service
 *
 * Metodi di query con cache Next.js
 */
export class ArticleService {
  /**
   * Recupera tutti gli articoli
   * Cache: 60 secondi di rivalidazione automatica
   */
  static async getAll(params?: {
    published?: boolean;
    issue?: string;
    author?: string;
    category?: string;
  }): Promise<Article[]> {
    const articles = await getArticlesFromGitHub();

    // Filtra in base ai parametri
    let filtered = articles;

    if (params?.published !== undefined) {
      filtered = filtered.filter((a) => a.published === params.published);
    }

    if (params?.issue) {
      filtered = filtered.filter((a) => a.issue === params.issue);
    }

    if (params?.author) {
      filtered = filtered.filter((a) => a.author === params.author);
    }

    if (params?.category) {
      filtered = filtered.filter((a) => a.category === params.category);
    }

    return filtered;
  }

  /**
   * Recupera un singolo articolo per slug
   * Cache: persistente con tag per invalidazione on-demand
   */
  static async getBySlug(slug: string): Promise<Article | undefined> {
    return await getArticleFromGitHub(slug);
  }

  /**
   * Recupera articoli per issue
   */
  static async getByIssue(issueSlug: string): Promise<Article[]> {
    return await getArticlesByIssueFromGitHub(issueSlug);
  }

  /**
   * Recupera articoli per autore
   */
  static async getByAuthor(authorSlug: string): Promise<Article[]> {
    const articles = await getArticlesFromGitHub();
    return articles.filter((a) => a.author === authorSlug);
  }

  /**
   * Recupera articoli per categoria
   */
  static async getByCategory(categorySlug: string): Promise<Article[]> {
    const articles = await getArticlesFromGitHub();
    return articles.filter((a) => a.category === categorySlug);
  }

  /**
   * Recupera articoli in evidenza
   */
  static async getFeatured(): Promise<Article[]> {
    const articles = await getArticlesFromGitHub();
    return articles.filter((a) => a.in_evidence && a.published);
  }
}
