/* **************************************************
 * Imports
 **************************************************/
import "@/globals.css";
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
    title: "Middleware",
    description: "Middleware",
    alternates: {
      canonical: url,
      languages: {
        it: `/it/`,
      },
    },
    openGraph: createOpenGraphMetadata({
      title: "Middleware",
      description: "Middleware",
      url,
      type: "website",
    }),
    twitter: createTwitterMetadata({
      title: "Middleware",
      description: "Middleware",
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
export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
