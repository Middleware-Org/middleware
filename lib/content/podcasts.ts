/* **************************************************
 * Imports
 **************************************************/
import { podcasts } from "@/.velite";

/* **************************************************
 * Podcasts
 **************************************************/
export const getAllPodcasts = () =>
  podcasts
    .filter((p) => p.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

export const getPodcastBySlug = (slug: string) => {
  const podcast = podcasts.find((p) => p.slug === slug);
  return podcast && podcast.published ? podcast : undefined;
};

export const getPodcastsByIssue = (issueSlug: string) => {
  return getAllPodcasts().filter((podcast) => podcast.issue === issueSlug);
};
