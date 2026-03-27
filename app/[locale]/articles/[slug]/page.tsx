import type { Metadata } from "next";
import { notFound } from "next/navigation";

import StructuredData from "@/components/StructuredData";
import { getArticleBySlug, getAllArticles } from "@/lib/content";
import { getAuthorById } from "@/lib/content/authors";
import { getCategoryById } from "@/lib/content/categories";
import { getIssueById } from "@/lib/content/issues";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { i18nSettings } from "@/lib/i18n/settings";
import { getDictionary } from "@/lib/i18n/utils";
import { getBaseUrl } from "@/lib/utils/metadata";

import type { Article as ArticleType, Author, Category, Issue } from "@/.velite";

import Article from "./components/Article";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

type ResolvedArticleData = {
  article: ArticleType;
  author: Author | undefined;
  category: Category | undefined;
  issue: Issue | undefined;
};

function resolveArticleData(slug: string): ResolvedArticleData | null {
  const article = getArticleBySlug(slug);
  if (!article) return null;
  return {
    article,
    author: getAuthorById(article.authorId),
    category: getCategoryById(article.categoryId),
    issue: article.issueId ? getIssueById(article.issueId) : undefined,
  };
}

function buildStructuredData(
  locale: string,
  slug: string,
  data: ResolvedArticleData,
): Array<Record<string, unknown>> {
  const { article, author, category, issue } = data;
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/${locale}/articles/${slug}`;
  const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({
    title: article.title,
    ...(author && { author: author.name }),
    ...(category && { category: category.name }),
    ...(issue?.color && { color: issue.color }),
  }).toString()}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: author?.name || "Middleware",
      url: author ? `${baseUrl}/${locale}/authors?author=${author.slug}` : baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Middleware",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon0.svg`,
      },
    },
    datePublished: article.date,
    dateModified: article.last_update || article.date,
    image: ogImageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: category?.name || "Tecnologia",
    keywords: "tecnologia, innovazione, digitale",
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
        name: "Articoli",
        item: `${baseUrl}/${locale}/archive`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return [articleSchema, breadcrumbSchema];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = resolveArticleData(slug);

  if (!data) {
    return {
      title: "Articolo non trovato",
      description: "L'articolo richiesto non esiste",
    };
  }

  const { article, author, category, issue } = data;
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/${locale}/articles/${slug}`;

  const optimizedDescription =
    article.excerpt.length > 160 ? article.excerpt.substring(0, 157) + "..." : article.excerpt;

  const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({
    title: article.title,
    ...(author && { author: author.name }),
    ...(category && { category: category.name }),
    ...(issue?.color && { color: issue.color }),
  }).toString()}`;

  return {
    title: article.title,
    description: optimizedDescription,
    authors: author ? [{ name: author.name }] : [{ name: "Middleware" }],
    keywords: [category?.name, author?.name].filter(Boolean).join(", "),
    openGraph: {
      title: article.title,
      description: optimizedDescription,
      url: articleUrl,
      locale: locale,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.last_update || article.date,
      authors: author ? [author.name] : ["Middleware"],
      tags: [...(category ? [category.name] : []), ...(author ? [author.name] : [])],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      title: article.title,
      description: optimizedDescription,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: articleUrl,
    },
    other: {
      "article:published_time": article.date,
      "article:modified_time": article.last_update || article.date,
      "article:author": author?.name || "Middleware",
      "article:section": category?.name || "Tecnologia",
    },
  };
}

export const dynamicParams = false;

// Generate static params for all articles at build time
export async function generateStaticParams() {
  const articles = getAllArticles();
  const locales = i18nSettings.locales;

  return articles.flatMap((article) =>
    locales.map((locale) => ({
      locale,
      slug: article.slug,
    })),
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;

  const data = resolveArticleData(slug);

  if (!data) {
    notFound();
  }

  const { article, author, category, issue } = data;

  if (!author || !category) {
    notFound();
  }

  const [dict, commonDict] = await Promise.all([
    getDictionary(locale, TRANSLATION_NAMESPACES.ARTICLE),
    getDictionary(locale, TRANSLATION_NAMESPACES.COMMON),
  ]);

  return (
    <div>
      <StructuredData id={`article-ld-${slug}`} data={buildStructuredData(locale, slug, data)} />
      <Article
        article={article}
        author={author}
        category={category}
        issue={issue}
        dict={dict}
        commonDict={commonDict}
        locale={locale}
      />
    </div>
  );
}
