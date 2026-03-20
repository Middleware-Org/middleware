/* **************************************************
 * Imports
 **************************************************/
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import StaticPage from "@/components/organism/StaticPage";
import { getPageBySlug, getAllPages } from "@/lib/content";
import { i18nSettings } from "@/lib/i18n/settings";
import { getBaseUrl } from "@/lib/utils/metadata";

/* **************************************************
 * Types
 **************************************************/
type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    return {
      title: "Pagina non trovata",
      description: "La pagina richiesta non esiste",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/${locale}/${slug}`;
  const description =
    page.excerpt && page.excerpt.length > 160 ? `${page.excerpt.slice(0, 157)}...` : page.excerpt;

  return {
    title: page.title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: page.title,
      description,
      url: pageUrl,
      type: "article",
    },
    twitter: {
      title: page.title,
      description,
    },
  };
}

/* **************************************************
 * Generate Static Params
 **************************************************/
export async function generateStaticParams() {
  const pages = getAllPages();
  const locales = i18nSettings.locales;

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      locale,
      slug: page.slug,
    })),
  );
}

/* **************************************************
 * Page
 **************************************************/
export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <StaticPage page={page} />;
}
