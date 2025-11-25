/* **************************************************
 * Imports
 **************************************************/
import { getArticleBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import PodcastPlayer from "./components/PodcastPlayer";

/* **************************************************
 * Types
 **************************************************/
interface PodcastPageProps {
  params: Promise<{ locale: string; slug: string }>;
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
