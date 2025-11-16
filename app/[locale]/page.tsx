import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getTranslation } from "@/lib/i18n/server";



interface RootLayoutProps {
  params: { locale: string };
}



export default async function RootLayout({ params }: RootLayoutProps) {
  const t = await getTranslation(params.locale, TRANSLATION_NAMESPACES.HOME);

  return (
    <main>
      <h1>{t("title")}</h1>
    </main>
  );
}
