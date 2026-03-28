/* **************************************************
 * Imports
 **************************************************/
import { podcasts, issues } from "@/.velite";

const safePodcasts = Array.isArray(podcasts) ? podcasts : [];
const safeIssues = Array.isArray(issues) ? issues : [];

const publishedIssueBySlug = new Map(
  safeIssues.filter((issue) => issue.published).map((issue) => [issue.slug, issue]),
);

const publishedPodcastsSorted = safePodcasts
  .filter((podcast) => podcast.published)
  .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

const publishedPodcastBySlug = new Map(
  publishedPodcastsSorted.map((podcast) => [podcast.slug, podcast]),
);
const publishedPodcastById = new Map(
  publishedPodcastsSorted.map((podcast) => [podcast.id, podcast]),
);

const publishedPodcastsByIssueId = new Map<string, typeof safePodcasts>();

for (const podcast of publishedPodcastsSorted) {
  if (!podcast.issueId) {
    continue;
  }

  const issuePodcasts = publishedPodcastsByIssueId.get(podcast.issueId) ?? [];
  issuePodcasts.push(podcast);
  publishedPodcastsByIssueId.set(podcast.issueId, issuePodcasts);
}

/* **************************************************
 * Podcasts
 **************************************************/
export const getAllPodcasts = () => publishedPodcastsSorted;

export const getPodcastBySlug = (slug: string) => publishedPodcastBySlug.get(slug);

export const getPodcastById = (id: string) => publishedPodcastById.get(id);

export const getPodcastsByIssue = (issueSlug: string) => {
  const issue = publishedIssueBySlug.get(issueSlug);
  if (!issue) return [];

  return publishedPodcastsByIssueId.get(issue.id) ?? [];
};
