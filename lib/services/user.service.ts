/**
 * User Service
 * Server-side service per la gestione degli utenti con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllUsers as getAllUsersGithub } from '@/lib/github/users';

export const USER_CACHE_TAGS = {
  all: 'users',
} as const;

export class UserService {
  static getAll = unstable_cache(
    async (): Promise<string[]> => {
      return getAllUsersGithub();
    },
    ['users-all'],
    {
      revalidate: 60,
      tags: [USER_CACHE_TAGS.all],
    }
  );
}
