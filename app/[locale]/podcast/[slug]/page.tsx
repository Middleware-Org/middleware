/* **************************************************
 * Imports
 **************************************************/
import { getAllPodcasts, getPodcastBySlug, getIssueById } from "@/lib/content";
import { i18nSettings } from "@/lib/i18n/settings";
import { notFound } from "next/navigation";
import PodcastPlayer from "./components/PodcastPlayer";
import type { Metadata } from "next";
import { getBaseUrl, createOpenGraphMetadata, createTwitterMetadata } from "@/lib/utils/metadata";
import { getGitHubImageUrl } from "@/lib/github/images";
import StructuredData from "@/components/StructuredData";

/* **************************************************
 * Types
 **************************************************/
interface PodcastPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Generate Metadata
 **************************************************/
export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const podcast = getPodcastBySlug(slug);

  if (!podcast) {
    return {
      title: "Podcast non trovato",
      description: "Il podcast richiesto non esiste",
    };
  }

  const baseUrl = getBaseUrl();
  const podcastUrl = `${baseUrl}/${locale}/podcast/${slug}`;
  const issue = podcast.issueId ? getIssueById(podcast.issueId) : undefined;
  const ogImage = issue?.cover ? `${baseUrl}${issue.cover}` : undefined;

  return {
    title: podcast.title,
    description: podcast.description,
    openGraph: createOpenGraphMetadata({
      title: podcast.title,
      description: podcast.description,
      url: podcastUrl,
      type: "website",
      image: ogImage,
    }),
    twitter: createTwitterMetadata({
      title: podcast.title,
      description: podcast.description,
      image: ogImage,
    }),
    alternates: {
      canonical: podcastUrl,
    },
  };
}

function getPodcastStructuredData(locale: string, slug: string) {
  const podcast = getPodcastBySlug(slug);
  if (!podcast) {
    return [] as Array<Record<string, unknown>>;
  }

  const baseUrl = getBaseUrl();
  const podcastUrl = `${baseUrl}/${locale}/podcast/${slug}`;

  const podcastSchema = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: podcast.title,
    description: podcast.description,
    datePublished: podcast.date,
    dateModified: podcast.last_update || podcast.date,
    audio: {
      "@type": "AudioObject",
      contentUrl: getGitHubImageUrl(podcast.audio),
      description: podcast.description,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": podcastUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Podcasts",
        item: `${baseUrl}/${locale}/podcasts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: podcast.title,
        item: podcastUrl,
      },
    ],
  };

  return [podcastSchema, breadcrumbSchema];
}

/* **************************************************
 * Generate Static Params
 **************************************************/
export async function generateStaticParams() {
  const podcasts = getAllPodcasts();
  const locales = i18nSettings.locales;

  return podcasts.flatMap((podcast: { slug: string }) =>
    locales.map((locale) => ({
      locale,
      slug: podcast.slug,
    })),
  );
}

/* **************************************************
 * Podcast Page
 ***************************************************/
export default async function PodcastPage({ params }: PodcastPageProps) {
  const { locale, slug } = await params;

  const podcast = getPodcastBySlug(slug);

  if (!podcast) {
    notFound();
  }

  // Get associated issue for cover image
  const issue = podcast.issueId ? getIssueById(podcast.issueId) : undefined;

  return (
    <>
      <StructuredData id={`podcast-ld-${slug}`} data={getPodcastStructuredData(locale, slug)} />
      <PodcastPlayer podcast={podcast} issue={issue} />
    </>
  );
}
