/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

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

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.HOME);

  return (
    <main>
      <h1>{dict.title}</h1>
    </main>
  );
}
