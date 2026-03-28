/* **************************************************
 * Imports
 **************************************************/
import Footer from "@/components/organism/footer";
import Header from "@/components/organism/header";
import IssuesDropdown from "@/components/organism/issuesDropDown";
import Menu from "@/components/organism/menu";
import { getAllIssues } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

/* **************************************************
 * Types
 **************************************************/
interface HomeLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Layout
 **************************************************/
export default async function HomeLayout({ children, params }: HomeLayoutProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issues = getAllIssues();

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-secondary focus:text-primary focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-tertiary"
      >
        Salta al contenuto principale
      </a>
      <Header dict={dict}>
        <IssuesDropdown issues={issues} />
      </Header>
      <Menu dict={dict} />
      <main id="main-content" className="w-full">
        {children}
      </main>
      <Footer dict={dict} />
    </>
  );
}
