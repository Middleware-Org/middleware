/* **************************************************
 * Imports
 **************************************************/
import { podcasts } from "@/.velite";
import { getAllArticles } from "./articles";

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

export const getUnassignedPodcasts = () => {
  const allPodcasts = getAllPodcasts();
  const allArticles = getAllArticles();

  const assignedPodcastSlugs = new Set(
    allArticles.filter((article) => article.podcast).map((article) => article.podcast),
  );

  return allPodcasts.filter((podcast) => !assignedPodcastSlugs.has(podcast.slug));
};
