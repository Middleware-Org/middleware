/* **************************************************
 * Imports
 **************************************************/
import { Book } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import FormattedDate from "@/components/atoms/date";
import Separator from "@/components/atoms/separetor";
import { H1, H2, MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import PodcastCard from "@/components/molecules/podcastCard";
import SeparatorWithLogo from "@/components/molecules/SeparatorWithLogo";
import StructuredData from "@/components/StructuredData";
import {
  getAllPodcasts,
  getArticleByPodcastId,
  getAuthorById,
  getCategoryById,
  getPodcastBySlug,
  getIssueById,
} from "@/lib/content";
import { getPodcastsByIssue } from "@/lib/content/podcasts";
import { getGitHubImageUrl } from "@/lib/github/images";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { i18nSettings } from "@/lib/i18n/settings";
import { getDictionary } from "@/lib/i18n/utils";
import { getBaseUrl, createOpenGraphMetadata, createTwitterMetadata } from "@/lib/utils/metadata";
import { getMinText } from "@/lib/utils/text";

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

export const dynamicParams = false;

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

  const relatedArticle = getArticleByPodcastId(podcast.id);
  const relatedAuthor = relatedArticle ? getAuthorById(relatedArticle.authorId) : undefined;
  const relatedCategory = relatedArticle ? getCategoryById(relatedArticle.categoryId) : undefined;
  const listeningTime = relatedArticle ? getMinText(relatedArticle.content) : null;
  const articleHref = relatedArticle
    ? withLocale(`/articles/${relatedArticle.slug}`, locale)
    : null;
  const authorHref = relatedAuthor
    ? withLocale(`/authors?author=${relatedAuthor.slug}`, locale)
    : null;
  const categoryHref = relatedCategory
    ? withLocale(`/categories?category=${relatedCategory.slug}`, locale)
    : null;

  const [commonDict, podcastDict] = await Promise.all([
    getDictionary(locale, TRANSLATION_NAMESPACES.COMMON),
    getDictionary(locale, TRANSLATION_NAMESPACES.PODCAST),
  ]);

  return (
    <>
      <StructuredData id={`podcast-ld-${slug}`} data={getPodcastStructuredData(locale, slug)} />
      <header className="lg:px-10 md:px-4 px-4 lg:pt-10 py-[25px] w-full max-w-[1472px] mx-auto">
        <div className="w-full flex flex-col">
          <div className="flex gap-2.5 items-baseline">
            <MonoTextLight className="border-b border-secondary lg:pb-2.5 lg:text-lg text-base mb-5">
              {podcastDict.page.wordsBy}
            </MonoTextLight>
            {relatedAuthor ? (
              <Link href={authorHref || "#"}>
                <MonoTextBold className="lg:pb-2.5 lg:text-lg text-base mb-5">
                  {relatedAuthor.name}
                </MonoTextBold>
              </Link>
            ) : (
              <MonoTextBold className="lg:pb-2.5 lg:text-lg text-base mb-5">
                Middleware
              </MonoTextBold>
            )}
          </div>
          <H1>{podcast.title}</H1>
        </div>
        <Separator className="lg:mt-[30px] lg:mb-2.5 mt-2.5 mb-2.5" />
        <div className="flex flex-row justify-between">
          <span className="lg:text-[16px] text-[14px] flex items-center gap-2.5">
            <FormattedDate date={podcast.date} lang={locale} />
          </span>
          {relatedArticle && (
            <Link href={articleHref || "#"} className="flex items-center gap-2 hover:underline">
              <Book className="w-4 h-4" />
              <MonoTextLight className="lg:text-[16px] text-[14px]">
                {podcastDict.page.readArticle}
              </MonoTextLight>
            </Link>
          )}
        </div>
        <Separator className="lg:mt-2.5 lg:mb-2.5 mt-2.5 mb-2.5" />
        <div className="flex justify-between items-center">
          {relatedCategory ? (
            <Link href={categoryHref || "#"}>
              <MonoTextLight className="hover:underline">{relatedCategory.name}</MonoTextLight>
            </Link>
          ) : (
            <div />
          )}
          {listeningTime && (
            <div className="lg:text-[16px] text-[12px] flex items-center gap-2 text-secondary">
              <Book className="w-5 h-5" />
              <MonoTextLight className="lg:text-[16px] text-[12px]">
                {listeningTime} {podcastDict.page.listeningTime}
              </MonoTextLight>
            </div>
          )}
        </div>
        <Separator className="lg:mt-2.5 lg:mb-2.5 mt-2.5 mb-2.5" />
      </header>
      <section className="w-full flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5">
        <div className="w-full lg:max-w-[75%] max-w-full">
          <H2 className="lg:text-[32px]! md:text-[28px]! text-[20px]! mb-[15px]">
            {podcast.description}
          </H2>
        </div>
      </section>
      <PodcastPlayer
        podcast={{
          slug: podcast.slug,
          audio: podcast.audio,
          audio_chunks: podcast.audio_chunks,
        }}
      />
      {relatedAuthor?.description && (
        <footer className="flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5">
          <div className="flex lg:flex-row md:flex-row flex-col justify-between gap-10">
            <div className="lg:w-1/4 lg:flex hidden"></div>
            <div className="lg:w-2/4 md:w-full w-full">
              <SeparatorWithLogo />
              <div className="py-[25px] text-center">
                <MonoTextLight>Middleware — Laboratorio di contro-formazione</MonoTextLight>
              </div>
            </div>
            <div className="lg:w-1/4 lg:flex hidden"></div>
          </div>
        </footer>
      )}
      {relatedPodcasts.length > 0 && (
        <>
          <div className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4">
            <Separator />
          </div>
          <section className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 pb-0 pt-[25px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPodcasts.map((relatedPodcast) => (
                <PodcastCard
                  key={relatedPodcast.slug}
                  podcast={relatedPodcast}
                  dict={commonDict}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
