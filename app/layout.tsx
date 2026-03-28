/* **************************************************
 * Imports
 **************************************************/
import "@/globals.css";
import Toaster from "@/components/ui/LazyToaster";
import { editorFont, gtAmericaMono } from "@/lib/fonts";
import { getBaseUrl, createOpenGraphMetadata, createTwitterMetadata } from "@/lib/utils/metadata";

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
      default: "Middleware — Laboratorio di contro-formazione",
      template: "%s | Middleware",
    },
    description:
      "Middleware si inserisce tra input e output per leggere, interpretare e deviare i processi, traducendo teoria e pratica in modo circolare.",
    keywords: [
      "contro-formazione",
      "operaismo",
      "militanza intermedista",
      "classe",
      "conricerca",
      "podcast",
      "analisi politica",
      "teoria e pratica",
    ],
    authors: [{ name: "Team Middleware" }],
    creator: "Middleware",
    publisher: "Middleware Media",
    alternates: {
      canonical: url,
      languages: {
        it: `/it/`,
      },
      types: {
        "application/rss+xml": [{ url: "/rss.xml", title: "Middleware RSS Feed" }],
      },
    },
    openGraph: createOpenGraphMetadata({
      title: "Middleware — Laboratorio di contro-formazione",
      description:
        "Middleware si inserisce tra input e output per leggere, interpretare e deviare i processi, traducendo teoria e pratica in modo circolare.",
      url,
      type: "website",
    }),
    twitter: createTwitterMetadata({
      title: "Middleware — Laboratorio di contro-formazione",
      description:
        "Middleware si inserisce tra input e output per leggere, interpretare e deviare i processi, traducendo teoria e pratica in modo circolare.",
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
      <body className={editorFont.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
