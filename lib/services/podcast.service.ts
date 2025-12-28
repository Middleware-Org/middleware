/**
 * Podcast Service
 * Server-side service per la gestione dei podcast con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllPodcasts as getAllPodcastsGithub, getPodcastBySlug as getPodcastBySlugGithub } from '@/lib/github/podcasts';
import type { Podcast } from '@/lib/github/types';

export const PODCAST_CACHE_TAGS = {
  all: 'podcasts',
  detail: (slug: string) => `podcast-${slug}`,
} as const;

export class PodcastService {
  static getAll = unstable_cache(
    async (): Promise<Podcast[]> => {
      return getAllPodcastsGithub();
    },
    ['podcasts-all'],
    {
      revalidate: 60,
      tags: [PODCAST_CACHE_TAGS.all],
    }
  );

  static getBySlug = unstable_cache(
    async (slug: string): Promise<Podcast | undefined> => {
      return getPodcastBySlugGithub(slug);
    },
    ['podcast-by-slug'],
    {
      tags: (slug: string) => [PODCAST_CACHE_TAGS.detail(slug), PODCAST_CACHE_TAGS.all],
    }
  );
}
