/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import { getPodcastBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import Footer from "@/components/organism/footer";
import {
  getBaseUrl,
  createOpenGraphMetadata,
  createTwitterMetadata,
  createPodcastSchema,
} from "@/lib/utils/metadata";
import StructuredData from "@/components/StructuredData";
import AutoScrollText from "@/components/organism/autoScrollText";

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

  if (!slug) {
    return null;
  }

  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const podcast = getPodcastBySlug(slug);

  if (!podcast) {
    return null;
  }

  const ogImage = podcast.cover ? `${getBaseUrl()}${podcast.cover}` : undefined;
  const url = `${getBaseUrl()}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}/${podcast.slug}`;
  const title = `${dictCommon.meta.title} - ${podcast.title}`;

  return {
    title,
    description: podcast.description,
    alternates: {
      canonical: url,
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.PODCAST}`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: podcast.title,
      description: podcast.description,
      url,
      type: "website",
      image: ogImage,
    }),
    twitter: createTwitterMetadata({
      title: podcast.title,
      description: podcast.description,
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

  if (!slug) {
    notFound();
  }

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const podcast = getPodcastBySlug(slug);

  if (!podcast) {
    notFound();
  }

  const podcastSchema = createPodcastSchema({
    title: podcast.title,
    description: podcast.description,
    url: `${getBaseUrl()}/${locale}/${TRANSLATION_NAMESPACES.PODCAST}/${podcast.slug}`,
  });

  return (
    <>
      <StructuredData data={podcastSchema} />
      <Header dict={dict}>
        <AutoScrollText once={true}>
          <MonoTextLight className="text-xs! md:text-base!">{podcast.title}</MonoTextLight>
        </AutoScrollText>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
