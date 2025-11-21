/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import "@/globals.css";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/content";

/* **************************************************
 * Types
 **************************************************/
interface SlugLayoutProps {
  params: Promise<{ locale: string; slug: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: SlugLayoutProps) {
  const { locale, slug } = await params;

  const page = getPageBySlug(slug);

  if (!page) {
    const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
    return {
      title: dict.meta.title,
      description: dict.meta.description,
    };
  }

  return {
    title: page.title,
    description: page.excerpt,
    alternates: {
      languages: {
        [locale]: `/${locale}/${slug}`,
      },
    },
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function SlugLayout({ children, params }: SlugLayoutProps) {
  const { locale, slug } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const page = getPageBySlug(slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">{page.title}</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
    </>
  );
}
