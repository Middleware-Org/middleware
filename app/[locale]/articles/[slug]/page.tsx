import { getArticleBySlug, getAllArticles } from "@/lib/content";
import { getAuthorBySlug } from "@/lib/content/authors";
import { getCategoryBySlug } from "@/lib/content/categories";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { i18nSettings } from "@/lib/i18n/settings";
import { getBaseUrl } from "@/lib/utils/metadata";
import { notFound } from "next/navigation";
import Article from "./components/Article";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Articolo non trovato",
      description: "L'articolo richiesto non esiste",
    };
  }

  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/${locale}/articles/${slug}`;

  // Structured data for Article
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
    image: `${baseUrl}/og-image.png`,
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

  return {
    title: article.title,
    description: article.excerpt,
    authors: author ? [{ name: author.name }] : [{ name: "Middleware" }],
    keywords: "tecnologia, innovazione, digitale, " + (category?.name || ""),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      locale: locale,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.last_update || article.date,
      authors: author ? [author.name] : ["Middleware"],
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      title: article.title,
      description: article.excerpt,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: articleUrl,
    },
    other: {
      "article:published_time": article.date,
      "article:modified_time": article.last_update || article.date,
      "article:author": author?.name || "Middleware",
      "article:section": category?.name || "Tecnologia",
      "application/ld+json": JSON.stringify([articleSchema, breadcrumbSchema]),
    },
  };
}

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

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.ARTICLE);

  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <Article article={article} dict={dict} />
    </div>
  );
}
