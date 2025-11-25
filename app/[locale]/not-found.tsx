/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/organism/header";
import Menu from "@/components/organism/menu";
import Footer from "@/components/organism/footer";
import { SerifText, MonoTextLight } from "@/components/atoms/typography";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { i18nSettings } from "@/lib/i18n/settings";
import Button from "@/components/atoms/button";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-4 md:px-4 lg:px-10 py-6 md:py-6 lg:py-10"),
  content: cn("flex flex-col items-center justify-center min-h-[60vh] text-center"),
  title: cn("mb-6"),
  message: cn("mb-8 max-w-2xl"),
  button: cn("mt-4"),
};

/* **************************************************
 * Types
 **************************************************/
type NotFoundProps = {
  params?: Promise<{ locale?: string }>;
};

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: NotFoundProps) {
  const resolvedParams = params ? await params : {};
  const locale = resolvedParams.locale || i18nSettings.defaultLocale;
  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return {
    title: `${dict.meta.title} - 404`,
    description: "La pagina che stai cercando non esiste.",
  };
}

/* **************************************************
 * Not Found Page
 **************************************************/
export default async function NotFound({ params }: NotFoundProps) {
  // Estrai il locale dai params se disponibili, altrimenti prova a estrarre dall'URL
  let locale = i18nSettings.defaultLocale;

  if (params) {
    const resolvedParams = await params;
    locale = resolvedParams.locale || locale;
  } else {
    // Prova a estrarre il locale dall'URL usando headers
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
    const localeMatch = pathname.match(/\/([a-z]{2})(?:\/|$)/);
    if (localeMatch && i18nSettings.locales.includes(localeMatch[1])) {
      locale = localeMatch[1];
    }
  }

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className="text-xs! md:text-base!">404</MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className="w-full">
        <div className={styles.container}>
          <div className={styles.content}>
            <SerifText className={styles.title} style={{ fontSize: "4rem", lineHeight: "1" }}>
              404
            </SerifText>
            <MonoTextLight className={styles.message} style={{ fontSize: "1.25rem" }}>
              La pagina che stai cercando non esiste o è stata spostata.
            </MonoTextLight>
            <Link href={`/${locale}`}>
              <Button variants="primary" className={styles.button}>
                <MonoTextLight>Torna alla home</MonoTextLight>
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </>
  );
}
