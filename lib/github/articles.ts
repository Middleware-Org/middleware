/* **************************************************
 * Imports
 **************************************************/
import matter from "gray-matter";
import { createOrUpdateFile, deleteFile, getFileContent, listDirectoryFiles } from "./client";
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
  const slug = article.slug || article.title.toLowerCase().replace(/\s+/g, "-");

  // Crea il frontmatter
  const frontmatter = {
    slug,
    title: article.title,
    date: article.date,
    author: article.author,
    category: article.category,
    issue: article.issue,
    in_evidence: article.in_evidence ?? false,
    excerpt: article.excerpt || "",
  };

  // Combina frontmatter e contenuto
  const fileContent = matter.stringify(article.content, frontmatter);

  const filePath = `content/articles/${slug}.md`;
  await createOrUpdateFile(filePath, fileContent, `Create article: ${article.title}`);

  return { ...article, slug };
}

export async function updateArticle(slug: string, article: Partial<Omit<Article, "slug">>) {
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

  const updated: Article = {
    slug: fileSlug,
    title: article.title ?? existing.title,
    date: article.date ?? existing.date,
    author: article.author ?? existing.author,
    category: article.category ?? existing.category,
    issue: article.issue ?? existing.issue,
    in_evidence: article.in_evidence !== undefined ? article.in_evidence : existing.in_evidence,
    excerpt: article.excerpt ?? existing.excerpt,
    content: article.content ?? existing.content,
  };

  const frontmatter = {
    slug: fileSlug,
    title: updated.title,
    date: updated.date,
    author: updated.author,
    category: updated.category,
    issue: updated.issue,
    in_evidence: updated.in_evidence,
    excerpt: updated.excerpt,
  };

  const fileContent = matter.stringify(updated.content, frontmatter);
  const filePath = `content/articles/${fileSlug}.md`;

  await createOrUpdateFile(filePath, fileContent, `Update article: ${updated.title}`);

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
