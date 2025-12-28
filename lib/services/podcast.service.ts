/* **************************************************
 * Podcast Service - Cache-aware con Next.js
 ************************************************** */

import type { Podcast } from "@/lib/github/types";
import {
  getAllPodcasts as getPodcastsFromGitHub,
  getPodcastBySlug as getPodcastFromGitHub,
} from "@/lib/github/podcasts";

/**
 * Cache tags per invalidazione granulare
 */
export const PODCAST_CACHE_TAGS = {
  all: "podcasts",
  bySlug: (slug: string) => `podcast-${slug}`,
} as const;

/**
 * Podcast Service
 */
export class PodcastService {
  /**
   * Recupera tutti i podcast
   */
  static async getAll(params?: { published?: boolean }): Promise<Podcast[]> {
    const podcasts = await getPodcastsFromGitHub();

    if (params?.published !== undefined) {
      return podcasts.filter((p) => p.published === params.published);
    }

    return podcasts;
  }

  /**
   * Recupera un singolo podcast per slug
   */
  static async getBySlug(slug: string): Promise<Podcast | undefined> {
    return await getPodcastFromGitHub(slug);
  }
}
