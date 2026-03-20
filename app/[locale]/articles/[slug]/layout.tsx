/* **************************************************
 * Imports
 **************************************************/
import { notFound } from "next/navigation";

import { MonoTextLight } from "@/components/atoms/typography";
import ReadingProgress from "@/components/molecules/ReadingProgress";
import AutoScrollText from "@/components/organism/autoScrollText";
import Footer from "@/components/organism/footer";
import Header from "@/components/organism/header";
import Menu from "@/components/organism/menu";
import { getArticleBySlug } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";



/* **************************************************
 * Types
 **************************************************/
interface ArticleLayoutProps {
  params: Promise<{ locale: string; slug: string }>;
  children: React.ReactNode;
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
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-secondary focus:text-primary focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-tertiary"
      >
        Salta al contenuto principale
      </a>
      <ReadingProgress />
      <Header dict={dict}>
        <AutoScrollText once={true}>
          <MonoTextLight className="text-xs! md:text-base!">{article.title}</MonoTextLight>
        </AutoScrollText>
      </Header>
      <Menu dict={dict} />
      <main id="main-content" className="w-full" tabIndex={-1}>
        {children}
      </main>
      <Footer dict={dict} />
    </>
  );
}
