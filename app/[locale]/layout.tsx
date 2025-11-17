/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import "@/globals.css";
import IssuesDropdown from "@/components/organism/issuesDropDown";
import Menu from "@/components/organism/menu";

/* **************************************************
 * Types
 **************************************************/
interface RootLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: RootLayoutProps) {
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
export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <html lang={locale}>
      <body>
        <Header dict={dict}>
          <IssuesDropdown
            issues={[{ id: "1", title: "Test", date: "2025-01-01", publishedAt: "2025-01-01" }]}
          />
        </Header>
        <Menu dict={dict} />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
