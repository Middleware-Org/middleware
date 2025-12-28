/**
 * Media Service
 * Server-side service per la gestione dei media con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllMediaFiles as getAllMediaFilesGithub } from '@/lib/github/media';

export const MEDIA_CACHE_TAGS = {
  all: 'media',
} as const;

export class MediaService {
  static getAll = unstable_cache(
    async (): Promise<string[]> => {
      return getAllMediaFilesGithub();
    },
    ['media-all'],
    {
      revalidate: 60,
      tags: [MEDIA_CACHE_TAGS.all],
    }
  );
}
