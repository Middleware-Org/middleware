/* **************************************************
 * Issue Service - Cache-aware con Next.js
 ************************************************** */

import type { Issue } from "@/lib/github/types";
import {
  getAllIssues as getIssuesFromGitHub,
  getIssueBySlug as getIssueFromGitHub,
} from "@/lib/github/issues";

/**
 * Cache tags per invalidazione granulare
 */
export const ISSUE_CACHE_TAGS = {
  all: "issues",
  bySlug: (slug: string) => `issue-${slug}`,
} as const;

/**
 * Issue Service
 */
export class IssueService {
  /**
   * Recupera tutti gli issue
   */
  static async getAll(params?: { published?: boolean }): Promise<Issue[]> {
    const issues = await getIssuesFromGitHub();

    if (params?.published !== undefined) {
      return issues.filter((i) => i.published === params.published);
    }

    return issues;
  }

  /**
   * Recupera un singolo issue per slug
   */
  static async getBySlug(slug: string): Promise<Issue | undefined> {
    return await getIssueFromGitHub(slug);
  }
}
