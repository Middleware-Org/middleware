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
import Footer from "@/components/organism/footer";
import {
  getBaseUrl,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/utils/metadata";

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

  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const page = getPageBySlug(slug);

  if (!page) {
    const url = `${getBaseUrl()}/${locale}`;
    return {
      title: dictCommon.meta.title,
      description: dictCommon.meta.description,
      openGraph: createOpenGraphMetadata({
        title: dictCommon.meta.title,
        description: dictCommon.meta.description,
        url,
        type: "website",
      }),
      twitter: createTwitterMetadata({
        title: dictCommon.meta.title,
        description: dictCommon.meta.description,
      }),
    };
  }

  const url = `${getBaseUrl()}/${locale}/${slug}`;
  const title = `${dictCommon.meta.title} - ${page.title}`;

  return {
    title,
    description: page.excerpt,
    alternates: {
      languages: {
        [locale]: `/${locale}/${slug}`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: page.title,
      description: page.excerpt,
      url,
      type: "website",
    }),
    twitter: createTwitterMetadata({
      title: page.title,
      description: page.excerpt,
    }),
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
      <Footer dict={dict} />
    </>
  );
}
