/* **************************************************
 * Imports
 **************************************************/
import { getArticleBySlug, getAllArticles } from "@/lib/content";
import { i18nSettings } from "@/lib/i18n/settings";
import { notFound } from "next/navigation";
import PodcastPlayer from "./components/PodcastPlayer";

/* **************************************************
 * Types
 **************************************************/
interface PodcastPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Generate Static Params
 **************************************************/
export async function generateStaticParams() {
  const articles = getAllArticles();
  const locales = i18nSettings.locales;

  // Only generate params for articles with audio
  const podcastArticles = articles.filter((article) => article.audio);

  return podcastArticles.flatMap((article) =>
    locales.map((locale) => ({
      locale,
      slug: article.slug,
    }))
  );
}

/* **************************************************
 * Podcast Page
 ***************************************************/
export default async function PodcastPage({ params }: PodcastPageProps) {
  const { slug } = await params;

  const article = getArticleBySlug(slug);

  if (!article || !article.audio) {
    notFound();
  }

  return <PodcastPlayer article={article} />;
}
