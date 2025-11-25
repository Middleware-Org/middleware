/* **************************************************
 * Metadata Utilities
 **************************************************/

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://middleware.media";

export function getBaseUrl() {
  return baseUrl;
}

export function getOpenGraphImage() {
  return `${baseUrl}/logo.svg`;
}

export function createOpenGraphMetadata({
  title,
  description,
  url,
  type = "website",
  image,
}: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
  image?: string;
}) {
  return {
    title,
    description,
    url,
    siteName: "Middleware",
    type,
    images: [
      {
        url: image || getOpenGraphImage(),
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  };
}

export function createTwitterMetadata({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image?: string;
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [image || getOpenGraphImage()],
  };
}

export function createArticleSchema({
  headline,
  datePublished,
  dateModified,
  authorName,
  url,
  description,
  image,
}: {
  headline: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
  description?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Middleware",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(description && { description }),
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  };
}
