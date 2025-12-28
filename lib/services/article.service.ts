/**
 * Article Service
 * Server-side service per la gestione degli articoli con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllArticles as getAllArticlesGithub, getArticleBySlug as getArticleBySlugGithub } from '@/lib/github/articles';
import type { Article } from '@/lib/github/types';

/**
 * Cache tags per invalidazione granulare
 */
export const ARTICLE_CACHE_TAGS = {
  all: 'articles',
  detail: (slug: string) => `article-${slug}`,
} as const;

/**
 * Service per articoli con caching automatico Next.js
 */
export class ArticleService {
  /**
   * Recupera tutti gli articoli
   * Cache: 60 secondi di rivalidazione automatica
   */
  static getAll = unstable_cache(
    async (): Promise<Article[]> => {
      return getAllArticlesGithub();
    },
    ['articles-all'],
    {
      revalidate: 60,
      tags: [ARTICLE_CACHE_TAGS.all],
    }
  );

  /**
   * Recupera un articolo per slug
   * Cache: persistente con tag per invalidazione on-demand
   */
  static getBySlug = unstable_cache(
    async (slug: string): Promise<Article | undefined> => {
      return getArticleBySlugGithub(slug);
    },
    ['article-by-slug'],
    {
      tags: (slug: string) => [ARTICLE_CACHE_TAGS.detail(slug), ARTICLE_CACHE_TAGS.all],
    }
  );
}
