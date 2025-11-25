/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import { getArticleBySlug, getIssueBySlug, getAuthorBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import Footer from "@/components/organism/footer";
import {
  getBaseUrl,
  createOpenGraphMetadata,
  createTwitterMetadata,
  createArticleSchema,
} from "@/lib/utils/metadata";
import StructuredData from "@/components/StructuredData";

/* **************************************************
 * Types
 **************************************************/
interface PodcastsLayoutProps {
  params: Promise<{ locale: string; slug?: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: PodcastsLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";
  const slug = resolvedParams?.slug || undefined;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.PODCAST);
  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  if (!slug) {
    const url = `${getBaseUrl()}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`;
    return {
      title: dict.meta.title,
      description: dict.meta.description,
      alternates: {
        languages: {
          [locale]: `/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`,
        },
      },
      openGraph: createOpenGraphMetadata({
        title: dict.meta.title,
        description: dict.meta.description,
        url,
        type: "website",
      }),
      twitter: createTwitterMetadata({
        title: dict.meta.title,
        description: dict.meta.description,
      }),
    };
  }

  const article = getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const issue = article.issue ? getIssueBySlug(article.issue) : null;
  const ogImage = issue?.cover ? `${getBaseUrl()}${issue.cover}` : undefined;
  const url = `${getBaseUrl()}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}/${article.slug}`;
  const title = `${dictCommon.meta.title} - ${article.title}`;

  return {
    title,
    description: article.excerpt,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      image: ogImage,
    }),
    twitter: createTwitterMetadata({
      title: article.title,
      description: article.excerpt,
      image: ogImage,
    }),
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function PodcastsLayout({ children, params }: PodcastsLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";
  const slug = resolvedParams?.slug || undefined;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const dictPodcast = await getDictionary(locale, TRANSLATION_NAMESPACES.PODCAST);

  if (!slug) {
    return (
      <>
        <Header dict={dict}>
          <MonoTextLight className="text-xs! md:text-base!">{dictPodcast.page.title}</MonoTextLight>
        </Header>
        <Menu dict={dict} />
        <main className="w-full">{children}</main>
        <Footer dict={dict} />
      </>
    );
  }

  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const author = getAuthorBySlug(article.author);
  const issue = article.issue ? getIssueBySlug(article.issue) : null;
  const url = `${getBaseUrl()}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}/${article.slug}`;
  const ogImage = issue?.cover ? `${getBaseUrl()}${issue.cover}` : undefined;

  const articleSchema = createArticleSchema({
    headline: article.title,
    datePublished: article.date,
    dateModified: article.date,
    authorName: author?.name || "Middleware",
    url,
    description: article.excerpt,
    image: ogImage,
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">{article.title}</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
