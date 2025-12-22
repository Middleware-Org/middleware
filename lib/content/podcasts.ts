/* **************************************************
 * Imports
 **************************************************/
import { podcasts } from "@/.velite";

/* **************************************************
 * Podcasts
 **************************************************/
export const getAllPodcasts = () =>
  podcasts.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));

export const getPodcastBySlug = (slug: string) => {
  const podcast = podcasts.find((p) => p.slug === slug);
  return podcast && podcast.published ? podcast : undefined;
};
