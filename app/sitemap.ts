/* **************************************************
 * Imports
 **************************************************/
import type { MetadataRoute } from "next";

import { getAllArticles, getAllIssues, getAllPages, getAllPodcasts } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { i18nSettings } from "@/lib/i18n/settings";

/* **************************************************
 * Sitemap
 **************************************************/
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://middleware.media";
  const locale = i18nSettings.defaultLocale;

  const [articles, issues, pages, podcasts] = await Promise.all([
    getAllArticles(),
    getAllIssues(),
    getAllPages(),
    getAllPodcasts(),
  ]);

  // Data più recente tra tutti gli articoli — usata per le pagine listing
  const latestArticleDate = articles.reduce<Date | undefined>((latest, article) => {
    const d = new Date(article.last_update || article.date);
    return !latest || d > latest ? d : latest;
  }, undefined);

  // Data più recente tra tutti i podcast — usata per la pagina listing podcasts
  const latestPodcastDate = podcasts.reduce<Date | undefined>((latest, podcast) => {
    const d = new Date(podcast.last_update || podcast.date);
    return !latest || d > latest ? d : latest;
  }, undefined);

  const fallbackDate = latestArticleDate ?? new Date("2024-01-01");
  const fallbackPodcastDate = latestPodcastDate ?? fallbackDate;

  // Route statiche — lastModified basato sui contenuti reali
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: fallbackDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.AUTHORS}`,
      lastModified: fallbackDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.CATEGORIES}`,
      lastModified: fallbackDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.ARCHIVE}`,
      lastModified: fallbackDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/podcasts`,
      lastModified: fallbackPodcastDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Route degli articoli
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/${locale}/articles/${article.slug}`,
    lastModified: new Date(article.last_update || article.date),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Route dei podcast
  const podcastRoutes: MetadataRoute.Sitemap = podcasts.map((podcast) => ({
    url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}/${podcast.slug}`,
    lastModified: new Date(podcast.last_update || podcast.date),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Route delle issues
  const issueRoutes: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${baseUrl}/${locale}/issues/${issue.slug}`,
    lastModified: new Date(issue.last_update || issue.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Route delle pagine statiche — nessuna data disponibile nello schema
  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${locale}/${page.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...podcastRoutes, ...issueRoutes, ...pageRoutes];
}
