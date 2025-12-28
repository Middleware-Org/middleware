/**
 * Author Service
 * Server-side service per la gestione degli autori con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllAuthors as getAllAuthorsGithub, getAuthorBySlug as getAuthorBySlugGithub } from '@/lib/github/authors';
import type { Author } from '@/lib/github/types';

export const AUTHOR_CACHE_TAGS = {
  all: 'authors',
  detail: (slug: string) => `author-${slug}`,
} as const;

export class AuthorService {
  static getAll = unstable_cache(
    async (): Promise<Author[]> => {
      return getAllAuthorsGithub();
    },
    ['authors-all'],
    {
      revalidate: 60,
      tags: [AUTHOR_CACHE_TAGS.all],
    }
  );

  static getBySlug = unstable_cache(
    async (slug: string): Promise<Author | undefined> => {
      return getAuthorBySlugGithub(slug);
    },
    ['author-by-slug'],
    {
      tags: (slug: string) => [AUTHOR_CACHE_TAGS.detail(slug), AUTHOR_CACHE_TAGS.all],
    }
  );
}
