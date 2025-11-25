/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/globals.css";
import PolicyBanner from "@/components/organism/banner";
import {
  getBaseUrl,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from "@/lib/utils/metadata";

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

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);
  const meta = dict.meta;

  const url = `${getBaseUrl()}/${locale}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
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
export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <html lang={locale}>
      <body>
        {children}
        <PolicyBanner dict={dict} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
