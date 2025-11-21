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

  const issue = getIssueBySlug(slug);

  if (!issue) {
    return null;
  }

  return {
    title: issue.title,
    description: issue.description,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.ISSUE}`,
      },
    },
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
    </>
  );
}
