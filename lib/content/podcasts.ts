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

export const getPodcastsByIssue = (issueSlug: string) => {
  // I podcasts non hanno issue direttamente, ma possiamo filtrare per data se necessario
  // Per ora restituiamo tutti i podcasts pubblicati
  return getAllPodcasts();
};

export const getUnassignedPodcasts = () => {
  const allPodcasts = getAllPodcasts();
  const allArticles = getAllArticles();

  // Crea un set di slug dei podcast assegnati ad articoli
  const assignedPodcastSlugs = new Set(
    allArticles
      .filter((article) => article.podcast)
      .map((article) => article.podcast),
  );

  // Restituisce solo i podcast non assegnati ad alcun articolo
  return allPodcasts.filter((podcast) => !assignedPodcastSlugs.has(podcast.slug));
};
