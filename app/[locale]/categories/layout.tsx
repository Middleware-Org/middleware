/* **************************************************
 * Imports
 **************************************************/
import Header from "@/components/organism/header";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Menu from "@/components/organism/menu";
import { MonoTextLight } from "@/components/atoms/typography";

/* **************************************************
 * Types
 **************************************************/
interface CategoriesLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: CategoriesLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";

  if (locale !== "it") {
    return null;
  }

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.CATEGORIES);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.CATEGORIES}`,
      },
    },
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function CategoriesLayout({ children, params }: CategoriesLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "it";

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const dictCategories = await getDictionary(locale, TRANSLATION_NAMESPACES.CATEGORIES);

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">
          {dictCategories.page.title}
        </MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">{children}</main>
    </>
  );
}
