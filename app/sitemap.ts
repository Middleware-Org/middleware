/* **************************************************
 * Imports
 **************************************************/
import { MetadataRoute } from "next";
import { getAllArticles, getAllIssues, getAllPages } from "@/lib/content";
import { i18nSettings } from "@/lib/i18n/settings";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";

/* **************************************************
 * Sitemap
 **************************************************/
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://middleware.media";
  const locale = i18nSettings.defaultLocale;

  // Ottieni tutti i contenuti
  const [articles, issues, pages] = await Promise.all([
    getAllArticles(),
    getAllIssues(),
    getAllPages(),
  ]);

  // Route statiche
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.AUTHORS}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.CATEGORIES}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.ARCHIVE}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Route degli articoli
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/${locale}/articles/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Route dei podcast (articoli con audio)
  const podcastRoutes: MetadataRoute.Sitemap = articles
    .filter((article) => article.audio)
    .map((article) => ({
      url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }));

  // Route delle issues
  const issueRoutes: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${baseUrl}/${locale}/${TRANSLATION_NAMESPACES.ISSUE}/${issue.slug}`,
    lastModified: new Date(issue.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Route delle pagine statiche
  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${locale}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  // Combina tutte le route
  return [...staticRoutes, ...articleRoutes, ...podcastRoutes, ...issueRoutes, ...pageRoutes];
}
