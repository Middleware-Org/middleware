/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PolicyBanner from "@/components/organism/banner";
import {
  getBaseUrl,
  createOpenGraphMetadata,
  createTwitterMetadata,
  createOrganizationSchema,
} from "@/lib/utils/metadata";
import StructuredData from "@/components/StructuredData";

/* **************************************************
 * Types
 **************************************************/
interface LocaleLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata({ params }: LocaleLayoutProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const meta = dict.meta;

  const url = `${getBaseUrl()}/${locale}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: {
        [locale]: `/${locale}/${TRANSLATION_NAMESPACES.HOME}`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: meta.title,
      description: meta.description,
      url,
      type: "website",
    }),
    twitter: createTwitterMetadata({
      title: meta.title,
      description: meta.description,
    }),
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Middleware",
    },
    icons: {
      icon: [
        { url: "/icon1.png", sizes: "32x32", type: "image/png" },
        { url: "/icon0.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    other: {
      "apple-mobile-web-app-title": "Middleware",
    },
  };
}

/* **************************************************
 * Layout
 **************************************************/
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const organizationSchema = createOrganizationSchema();

  return (
    <>
      <StructuredData data={organizationSchema} />
      {children}
      <PolicyBanner dict={dict} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
