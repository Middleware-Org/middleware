/**
 * Issue Service
 * Server-side service per la gestione dei numeri con caching Next.js
 */

import { unstable_cache } from 'next/cache';
import { getAllIssues as getAllIssuesGithub, getIssueBySlug as getIssueBySlugGithub } from '@/lib/github/issues';
import type { Issue } from '@/lib/github/types';

export const ISSUE_CACHE_TAGS = {
  all: 'issues',
  detail: (slug: string) => `issue-${slug}`,
} as const;

export class IssueService {
  static getAll = unstable_cache(
    async (): Promise<Issue[]> => {
      return getAllIssuesGithub();
    },
    ['issues-all'],
    {
      revalidate: 60,
      tags: [ISSUE_CACHE_TAGS.all],
    }
  );

  static getBySlug = unstable_cache(
    async (slug: string): Promise<Issue | undefined> => {
      return getIssueBySlugGithub(slug);
    },
    ['issue-by-slug'],
    {
      tags: (slug: string) => [ISSUE_CACHE_TAGS.detail(slug), ISSUE_CACHE_TAGS.all],
    }
  );
}
