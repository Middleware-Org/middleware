/**
 * Category Service
 * Server-side service per la gestione delle categorie con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllCategories as getAllCategoriesGithub, getCategoryBySlug as getCategoryBySlugGithub } from '@/lib/github/categories';
import type { Category } from '@/lib/github/types';

export const CATEGORY_CACHE_TAGS = {
  all: 'categories',
  detail: (slug: string) => `category-${slug}`,
} as const;

export class CategoryService {
  static getAll = unstable_cache(
    async (): Promise<Category[]> => {
      return getAllCategoriesGithub();
    },
    ['categories-all'],
    {
      revalidate: 60,
      tags: [CATEGORY_CACHE_TAGS.all],
    }
  );

  static getBySlug = unstable_cache(
    async (slug: string): Promise<Category | undefined> => {
      return getCategoryBySlugGithub(slug);
    },
    ['category-by-slug'],
    {
      tags: (slug: string) => [CATEGORY_CACHE_TAGS.detail(slug), CATEGORY_CACHE_TAGS.all],
    }
  );
}
