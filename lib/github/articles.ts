/* **************************************************
 * Imports
 **************************************************/
import matter from "gray-matter";
import {
  createOrUpdateFile,
  deleteFile,
  getFileContent,
  listDirectoryFiles,
  renameFile,
} from "./client";
import { generateSlug, generateUniqueSlug } from "./utils";
import type { Article } from "./types";

/* **************************************************
 * Articles
 ************************************************** */
export async function getAllArticles(): Promise<Article[]> {
  const files = await listDirectoryFiles("content/articles");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const articles = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        if (!content || content.trim().length === 0) {
          return null;
        }

        const { data, content: markdownContent } = matter(content);

        return {
          slug: data.slug || file.name.replace(".md", ""),
          title: data.title,
          date: data.date,
          author: data.author,
          category: data.category,
          issue: data.issue,
          in_evidence: data.in_evidence ?? false,
          excerpt: data.excerpt || "",
          content: markdownContent,
          audio: data.audio,
          audio_chunks: data.audio_chunks,
        } as Article;
      } catch {
        return null;
      }
    }),
  );

  const validArticles = articles.filter((article): article is Article => article !== null);

  return validArticles.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  try {
    const files = await listDirectoryFiles("content/articles");
    const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

    let file = mdFiles.find((f) => f.name === `${slug}.md`);

    if (!file) {
      for (const f of mdFiles) {
        try {
          const content = await getFileContent(f.path);
          if (!content || content.trim().length === 0) continue;

          const { data } = matter(content);
          if (data.slug === slug || f.name.replace(".md", "") === slug) {
            file = f;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!file) {
      return undefined;
    }

    const content = await getFileContent(file.path);

    if (!content || content.trim().length === 0) {
      return undefined;
    }

    try {
      const { data, content: markdownContent } = matter(content);

      return {
        slug: (data.slug as string) || slug,
        title: (data.title as string) || "Untitled",
        date: (data.date as string) || new Date().toISOString().split("T")[0],
        author: (data.author as string) || "",
        category: (data.category as string) || "",
        issue: (data.issue as string) || "",
        in_evidence: (data.in_evidence as boolean) ?? false,
        excerpt: (data.excerpt as string) || "",
        content: markdownContent || "",
        audio: (data.audio as string) || undefined,
        audio_chunks: (data.audio_chunks as string) || undefined,
      } as Article;
    } catch {
      return undefined;
    }
  } catch {
    return undefined;
  }
}

export async function getArticlesByIssue(issueSlug: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.issue === issueSlug);
}

export async function createArticle(article: Omit<Article, "slug"> & { slug?: string }) {
  // Generate slug from title if not provided
  const baseSlug = article.slug || generateSlug(article.title);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/articles", baseSlug, ".md");

  // Crea il frontmatter
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const frontmatter: Record<string, any> = {
    slug,
    title: article.title,
    date: article.date,
    author: article.author,
    category: article.category,
    issue: article.issue,
    in_evidence: article.in_evidence ?? false,
    excerpt: article.excerpt || "",
  };

  if (article.audio) {
    frontmatter.audio = article.audio;
  }
  if (article.audio_chunks) {
    frontmatter.audio_chunks = article.audio_chunks;
  }

  // Combina frontmatter e contenuto
  const fileContent = matter.stringify(article.content, frontmatter);

  const filePath = `content/articles/${slug}.md`;
  await createOrUpdateFile(filePath, fileContent, `Create article: ${article.title}`);

  return { ...article, slug };
}

export async function updateArticle(
  slug: string,
  article: Partial<Omit<Article, "slug">> & { newSlug?: string },
) {
  // Trova il file reale usando lo stesso metodo di getArticleBySlug
  const files = await listDirectoryFiles("content/articles");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  // Prima cerca per nome file esatto
  let file = mdFiles.find((f) => f.name === `${slug}.md`);

  // Se non trovato, cerca per slug nel frontmatter
  if (!file) {
    for (const f of mdFiles) {
      try {
        const content = await getFileContent(f.path);
        if (!content || content.trim().length === 0) continue;

        const { data } = matter(content);
        if (data.slug === slug || f.name.replace(".md", "") === slug) {
          file = f;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (!file) {
    throw new Error(`Article file not found for slug: ${slug}`);
  }

  const fileSlug = file.name.replace(".md", "");
  const existing = await getArticleBySlug(slug);

  if (!existing) {
    throw new Error(`Article ${slug} not found`);
  }

  // Gestisci cambio slug se necessario
  let finalSlug = fileSlug;
  if (article.newSlug && article.newSlug.trim() !== fileSlug) {
    const baseSlug = article.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/articles", baseSlug, ".md", fileSlug);
  }

  const updated: Article = {
    slug: finalSlug,
    title: article.title ?? existing.title,
    date: article.date ?? existing.date,
    author: article.author ?? existing.author,
    category: article.category ?? existing.category,
    issue: article.issue ?? existing.issue,
    in_evidence: article.in_evidence !== undefined ? article.in_evidence : existing.in_evidence,
    excerpt: article.excerpt ?? existing.excerpt,
    content: article.content ?? existing.content,
    audio: article.audio !== undefined ? article.audio : existing.audio,
    audio_chunks: article.audio_chunks !== undefined ? article.audio_chunks : existing.audio_chunks,
  };

  const frontmatter: Record<string, any> = {
    slug: finalSlug,
    title: updated.title,
    date: updated.date,
    author: updated.author,
    category: updated.category,
    issue: updated.issue,
    in_evidence: updated.in_evidence,
    excerpt: updated.excerpt,
  };

  if (updated.audio) {
    frontmatter.audio = updated.audio;
  }
  if (updated.audio_chunks) {
    frontmatter.audio_chunks = updated.audio_chunks;
  }

  const fileContent = matter.stringify(updated.content, frontmatter);
  const newFilePath = `content/articles/${finalSlug}.md`;
  const oldFilePath = `content/articles/${fileSlug}.md`;

  // Se lo slug è cambiato, rinomina il file, altrimenti aggiorna normalmente
  if (finalSlug !== fileSlug) {
    await renameFile(
      oldFilePath,
      newFilePath,
      fileContent,
      `Rename article: ${updated.title} (${fileSlug} -> ${finalSlug})`,
    );
  } else {
    await createOrUpdateFile(newFilePath, fileContent, `Update article: ${updated.title}`);
  }

  return updated;
}

export async function deleteArticle(slug: string) {
  const article = await getArticleBySlug(slug);
  if (!article) {
    throw new Error(`Article ${slug} not found`);
  }

  const filePath = `content/articles/${slug}.md`;
  await deleteFile(filePath, `Delete article: ${slug}`);
}
