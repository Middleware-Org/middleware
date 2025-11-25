/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import { getArticleBySlug, getIssueBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/molecules/ReadingProgress";
import Footer from "@/components/organism/footer";
import {
  getBaseUrl,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/utils/metadata";

/* **************************************************
 * Types
 **************************************************/
interface ArticleLayoutProps {
  params: Promise<{ locale: string; slug: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: ArticleLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";
  const slug = resolvedParams?.slug || "";

  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const article = getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const issue = article.issue ? getIssueBySlug(article.issue) : null;
  const ogImage = issue?.cover ? `${getBaseUrl()}${issue.cover}` : undefined;
  const url = `${getBaseUrl()}/${locale}/articles/${article.slug}`;
  const title = `${dictCommon.meta.title} - ${article.title}`;

  return {
    title,
    description: article.excerpt,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.AUTHORS}`,
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
export default async function ArticleLayout({ children, params }: ArticleLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";
  const slug = resolvedParams?.slug || "";

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">{article.title}</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
