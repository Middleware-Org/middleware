/**
 * Page Service
 * Server-side service per la gestione delle pagine con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllPages as getAllPagesGithub, getPageBySlug as getPageBySlugGithub } from '@/lib/github/pages';
import type { Page } from '@/lib/github/types';

export const PAGE_CACHE_TAGS = {
  all: 'pages',
  detail: (slug: string) => `page-${slug}`,
} as const;

export class PageService {
  static getAll = unstable_cache(
    async (): Promise<Page[]> => {
      return getAllPagesGithub();
    },
    ['pages-all'],
    {
      revalidate: 60,
      tags: [PAGE_CACHE_TAGS.all],
    }
  );

  static getBySlug = unstable_cache(
    async (slug: string): Promise<Page | undefined> => {
      return getPageBySlugGithub(slug);
    },
    ['page-by-slug'],
    {
      tags: (slug: string) => [PAGE_CACHE_TAGS.detail(slug), PAGE_CACHE_TAGS.all],
    }
  );
}
