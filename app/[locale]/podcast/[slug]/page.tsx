/* **************************************************
 * Imports
 **************************************************/
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Separator from "@/components/atoms/separetor";
import PodcastCard from "@/components/molecules/podcastCard";
import StructuredData from "@/components/StructuredData";
import { getAllPodcasts, getPodcastBySlug, getIssueById } from "@/lib/content";
import { getPodcastsByIssue } from "@/lib/content/podcasts";
import { getGitHubImageUrl } from "@/lib/github/images";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { i18nSettings } from "@/lib/i18n/settings";
import { getDictionary } from "@/lib/i18n/utils";
import { getBaseUrl, createOpenGraphMetadata, createTwitterMetadata } from "@/lib/utils/metadata";

import PodcastPlayer from "./components/PodcastPlayer";

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

// Enable Incremental Static Regeneration (ISR) - revalidate every hour
export const revalidate = 3600;

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

  // Get related podcasts from the same issue
  const relatedPodcasts = (() => {
    if (!podcast.issueId) return [];
    const issueData = issue;
    if (!issueData) return [];
    return getPodcastsByIssue(issueData.slug).filter((p) => p.slug !== podcast.slug);
  })();

  const commonDict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <>
      <StructuredData id={`podcast-ld-${slug}`} data={getPodcastStructuredData(locale, slug)} />
      <PodcastPlayer podcast={podcast} issue={issue} />
      {relatedPodcasts.length > 0 && (
        <>
          <div className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4">
            <Separator />
          </div>
          <section className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 pb-0 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPodcasts.map((relatedPodcast) => (
                <PodcastCard key={relatedPodcast.slug} podcast={relatedPodcast} dict={commonDict} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
