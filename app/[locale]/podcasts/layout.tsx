/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import { getArticleBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import Footer from "@/components/organism/footer";

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
    return {
      title: dict.meta.title,
      description: dict.meta.description,
      alternates: {
        languages: {
          [locale]: `/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`,
        },
      },
    };
  }

  const article = getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  return {
    title: `${dictCommon.meta.title} - ${article.title}`,
    description: article.excerpt,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`,
      },
    },
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

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">{article.title}</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
