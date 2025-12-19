/* **************************************************
 * Imports
 **************************************************/
import "@/globals.css";
import { getBaseUrl, createOpenGraphMetadata, createTwitterMetadata } from "@/lib/utils/metadata";
import { editorFont, gtAmericaMono } from "@/lib/fonts";

/* **************************************************
 * Types
 **************************************************/
interface RootLayoutProps {
  children: React.ReactNode;
}

/* **************************************************
 * Metadata
 **************************************************/
export async function generateMetadata() {
  const url = `${getBaseUrl()}/it`;

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: "Middleware - Rivista di cultura digitale e innovazione",
      template: "%s | Middleware",
    },
    description:
      "Middleware è la rivista italiana che esplora l'intersezione tra tecnologia, cultura e società. Articoli, podcast e analisi approfondite sul mondo digitale.",
    keywords: [
      "tecnologia",
      "innovazione",
      "cultura digitale",
      "podcast",
      "articoli tech",
      "società digitale",
      "media digitali",
    ],
    authors: [{ name: "Team Middleware" }],
    creator: "Middleware",
    publisher: "Middleware Media",
    alternates: {
      canonical: url,
      languages: {
        it: `/it/`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: "Middleware - Rivista di cultura digitale e innovazione",
      description:
        "Middleware è la rivista italiana che esplora l'intersezione tra tecnologia, cultura e società.",
      url,
      type: "website",
    }),
    twitter: createTwitterMetadata({
      title: "Middleware - Rivista di cultura digitale e innovazione",
      description:
        "Middleware è la rivista italiana che esplora l'intersezione tra tecnologia, cultura e società.",
    }),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
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
export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="it" className={`${editorFont.variable} ${gtAmericaMono.variable}`}>
      <body className={editorFont.className}>{children}</body>
    </html>
  );
}
