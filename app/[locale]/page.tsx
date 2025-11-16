/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getTranslation } from "@/lib/i18n/server";

/* **************************************************
 * Types
 **************************************************/
interface PageProps {
  params: Promise<{ locale: string }>;
}

/* **************************************************
 * Page
 **************************************************/
export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  const t = await getTranslation(locale, TRANSLATION_NAMESPACES.HOME);

  return (
    <main>
      <h1>{t("title")}</h1>
    </main>
  );
}
