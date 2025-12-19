/* **************************************************
 * Imports
 **************************************************/
import StaticPage from "@/components/organism/StaticPage";
import { getPageBySlug, getAllPages } from "@/lib/content";
import { i18nSettings } from "@/lib/i18n/settings";
import { notFound } from "next/navigation";

/* **************************************************
 * Types
 **************************************************/
type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

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
    }))
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
