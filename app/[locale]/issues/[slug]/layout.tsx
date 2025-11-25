/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import { getIssueBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import Footer from "@/components/organism/footer";
import { getBaseUrl, createOpenGraphMetadata, createTwitterMetadata } from "@/lib/utils/metadata";

/* **************************************************
 * Types
 **************************************************/
interface IssueLayoutProps {
  params: Promise<{ locale: string; slug: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: IssueLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";
  const slug = resolvedParams?.slug || "";

  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const issue = getIssueBySlug(slug);

  if (!issue) {
    return null;
  }

  const ogImage = issue.cover ? `${getBaseUrl()}${issue.cover}` : undefined;
  const url = `${getBaseUrl()}/${locale}/${TRANSLATION_NAMESPACES.ISSUE}/${issue.slug}`;
  const title = `${dictCommon.meta.title} - ${issue.title}`;

  return {
    title,
    description: issue.description,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.ISSUE}`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: issue.title,
      description: issue.description,
      url,
      type: "website",
      image: ogImage,
    }),
    twitter: createTwitterMetadata({
      title: issue.title,
      description: issue.description,
      image: ogImage,
    }),
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function IssueLayout({ children, params }: IssueLayoutProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const locale = resolvedParams?.locale || "it";

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issue = getIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">{issue.title}</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
