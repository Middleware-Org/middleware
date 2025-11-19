/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import "@/globals.css";
import IssuesDropdown from "@/components/organism/issuesDropDown";
import Menu from "@/components/organism/menu";
import { getAllIssues } from "@/lib/content";

/* **************************************************
 * Types
 **************************************************/
interface HomeLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: HomeLayoutProps) {
  const { locale } = await params;

  if (locale !== "it") {
    return null;
  }

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const meta = dict.meta;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.HOME}`,
      },
    },
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function HomeLayout({ children, params }: HomeLayoutProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issues = getAllIssues();

  return (
    <body>
      <Header dict={dict}>
        <IssuesDropdown issues={issues} />
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
    </body>
  );
}
