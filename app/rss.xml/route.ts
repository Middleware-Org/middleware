/* **************************************************
 * RSS Feed Generation
 * Generates an RSS 2.0 feed for articles and podcasts
 **************************************************/
import { getAllArticles, getAllPodcasts } from "@/lib/content";
import { getAuthorBySlug } from "@/lib/content/authors";
import { getCategoryBySlug } from "@/lib/content/categories";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://middleware.media";
  const articles = getAllArticles();
  const podcasts = getAllPodcasts();

  // Combine and sort articles and podcasts by date
  const items = [
    ...articles.map((article) => ({
      type: "article" as const,
      title: article.title,
      description: article.excerpt,
      url: `${baseUrl}/it/articles/${article.slug}`,
      date: new Date(article.date),
      author: getAuthorBySlug(article.author)?.name || "Middleware",
      category: getCategoryBySlug(article.category)?.name || "Tecnologia",
    })),
    ...podcasts.map((podcast) => ({
      type: "podcast" as const,
      title: podcast.title,
      description: podcast.description,
      url: `${baseUrl}/it/podcast/${podcast.slug}`,
      date: new Date(podcast.date),
      author: "Middleware",
      category: "Podcast",
      audio: podcast.audio,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Middleware - Rivista di cultura digitale e innovazione</title>
    <link>${baseUrl}</link>
    <description>Middleware è la rivista italiana che esplora l'intersezione tra tecnologia, cultura e società. Articoli, podcast e analisi approfondite sul mondo digitale.</description>
    <language>it</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <copyright>Copyright ${new Date().getFullYear()} Middleware Media</copyright>
    <webMaster>info@middleware.media (Middleware Team)</webMaster>
    <image>
      <url>${baseUrl}/logo.svg</url>
      <title>Middleware</title>
      <link>${baseUrl}</link>
    </image>
${items
  .slice(0, 50)
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.url}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <guid isPermaLink="true">${item.url}</guid>
      <dc:creator>${item.author}</dc:creator>
      <category>${item.category}</category>${
        item.type === "podcast" && "audio" in item && item.audio
          ? `
      <enclosure url="${item.audio}" type="audio/mpeg" />`
          : ""
      }
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
