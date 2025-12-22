import { defineConfig, s } from "velite";
export default defineConfig({
  collections: {
    articles: {
      name: "Article",
      pattern: "articles/**/*.md",
      schema: s.object({
        slug: s.slug("articles"),
        title: s.string().max(99),
        date: s.isodate(),
        last_update: s.isodate(),
        author: s.string(),
        category: s.string(),
        issue: s.string(),
        in_evidence: s.boolean().default(false),
        published: s.boolean().default(false),
        content: s.markdown(),
        excerpt: s.string().max(200),
        podcast: s.string().optional(),
      }),
    },
    podcasts: {
      name: "Podcast",
      pattern: "podcasts/**/*.json",
      schema: s.object({
        slug: s.slug("podcasts"),
        title: s.string().max(99),
        description: s.string(),
        date: s.isodate(),
        last_update: s.isodate(),
        audio: s.string(),
        audio_chunks: s.string(),
        cover: s.string().optional(),
        published: s.boolean().default(false),
      }),
    },
    authors: {
      name: "Author",
      pattern: "authors/**/*.json",
      schema: s.object({
        slug: s.slug("authors"),
        name: s.string(),
        description: s.string(),
      }),
    },
    categories: {
      name: "Category",
      pattern: "categories/**/*.json",
      schema: s.object({
        slug: s.slug("categories"),
        name: s.string(),
        description: s.string(),
      }),
    },
    issues: {
      name: "Issue",
      pattern: "issues/**/*.json",
      schema: s.object({
        slug: s.slug("issues"),
        date: s.isodate(),
        last_update: s.isodate(),
        title: s.string(),
        description: s.string(),
        cover: s.string(),
        color: s.string(),
        published: s.boolean().default(false),
      }),
    },
    pages: {
      name: "Page",
      pattern: "pages/**/*.md",
      schema: s.object({
        slug: s.slug("pages"),
        title: s.string().max(99),
        excerpt: s.string().max(200),
        content: s.markdown(),
      }),
    },
  },
});
