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
        author: s.string(),
        category: s.string(),
        issue: s.string(),
        in_evidence: s.boolean().default(false),
        content: s.markdown(),
        excerpt: s.string().max(200),
        order: s.number().optional(),
        audio: s.string().optional(),
        audio_chunks: s.string().optional(),
      }),
    },
    authors: {
      name: "Author",
      pattern: "authors/**/*.json",
      schema: s.object({
        slug: s.slug("authors"),
        name: s.string(),
        description: s.string(),
        order: s.number().optional(),
      }),
    },
    categories: {
      name: "Category",
      pattern: "categories/**/*.json",
      schema: s.object({
        slug: s.slug("categories"),
        name: s.string(),
        description: s.string(),
        order: s.number().optional(),
      }),
    },
    issues: {
      name: "Issue",
      pattern: "issues/**/*.json",
      schema: s.object({
        slug: s.slug("issues"),
        date: s.isodate(),
        title: s.string(),
        description: s.string(),
        cover: s.string(),
        color: s.string(),
        order: s.number().optional(),
      }),
    },
    pages: {
      name: "Page",
      pattern: "pages/**/*.md",
      schema: s.object({
        slug: s.slug("pages"),
        content: s.markdown(),
      }),
    },
  },
});
