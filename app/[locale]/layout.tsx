import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";



interface GenerateMetadataProps {
  params: Promise<{ locale: string }>;
}

interface RootLayoutProps {
  params: { locale: string };
  children: React.ReactNode;
}



export async function generateMetadata({ params }: GenerateMetadataProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const meta = dict.meta;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.HOME}`
      }
    }
  };
}



export default function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  return (
    <html lang={params.locale}>
      <body>
        {children}
      </body>
    </html>
  );
}
