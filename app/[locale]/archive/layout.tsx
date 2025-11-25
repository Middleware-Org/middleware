/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";
import Footer from "@/components/organism/footer";

/* **************************************************
 * Types
 **************************************************/
interface ArchiveLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: ArchiveLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.ARCHIVE);
  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return {
    title: `${dictCommon.meta.title} - ${dict.meta.title}`,
    description: dict.meta.description,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.AUTHORS}`,
      },
    },
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function ArchiveLayout({ children, params }: ArchiveLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const dictArchive = await getDictionary(locale, TRANSLATION_NAMESPACES.ARCHIVE);

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">{dictArchive.page.title}</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
