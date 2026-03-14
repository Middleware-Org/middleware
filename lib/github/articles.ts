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
import { addArticleToIssue, getIssueById, removeArticleFromIssue } from "./issues";
import type { Article } from "./types";
import { randomUUID } from "crypto";

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
          id: data.id as string,
          slug: (data.slug as string) || file.name.replace(".md", ""),
          title: data.title as string,
          date: data.date as string,
          last_update: (data.last_update as string) || (data.date as string),
          authorId: data.authorId as string,
          categoryId: data.categoryId as string,
          issueId: data.issueId as string | undefined,
          in_evidence: (data.in_evidence as boolean) ?? false,
          published: (data.published as boolean) ?? false,
          excerpt: (data.excerpt as string) || "",
          content: markdownContent,
          podcastId: data.podcastId as string | undefined,
          createdBy: data.createdBy as string,
        } as Article;
      } catch {
        return null;
      }
    }),
  );

  const validArticles = articles.filter((article): article is Article => article !== null);

  return validArticles.sort((a, b) => b.last_update.localeCompare(a.last_update));
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

    const { data, content: markdownContent } = matter(content);

    return {
      id: data.id as string,
      slug: (data.slug as string) || slug,
      title: (data.title as string) || "Untitled",
      date: (data.date as string) || new Date().toISOString().split("T")[0],
      last_update: (data.last_update as string) || (data.date as string),
      authorId: (data.authorId as string) || "",
      categoryId: (data.categoryId as string) || "",
      issueId: data.issueId as string | undefined,
      in_evidence: (data.in_evidence as boolean) ?? false,
      published: (data.published as boolean) ?? false,
      excerpt: (data.excerpt as string) || "",
      content: markdownContent || "",
      podcastId: data.podcastId as string | undefined,
      createdBy: (data.createdBy as string) || "",
    } as Article;
  } catch {
    return undefined;
  }
}

export async function getArticlesByIssueId(issueId: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.issueId === issueId);
}

export async function createArticle(
  article: Omit<Article, "slug" | "id"> & { slug?: string; createdBy: string },
) {
  const id = randomUUID();

  // Generate slug from title if not provided
  const baseSlug = article.slug || generateSlug(article.title);

  // Ensure slug is unique
  const slug = await generateUniqueSlug("content/articles", baseSlug, ".md");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const frontmatter: Record<string, any> = {
    id,
    slug,
    title: article.title,
    date: article.date,
    last_update: article.last_update || article.date,
    authorId: article.authorId,
    categoryId: article.categoryId,
    in_evidence: article.in_evidence ?? false,
    published: article.published ?? false,
    excerpt: article.excerpt || "",
    createdBy: article.createdBy,
  };

  if (article.issueId) {
    frontmatter.issueId = article.issueId;
  }

  if (article.podcastId) {
    frontmatter.podcastId = article.podcastId;
  }

  const fileContent = matter.stringify(article.content, frontmatter);

  const filePath = `content/articles/${slug}.md`;
  await createOrUpdateFile(filePath, fileContent, `Create article: ${article.title}`);

  // Add to issue ordering if issueId provided
  if (article.issueId) {
    const issue = await getIssueById(article.issueId);
    if (issue) {
      await addArticleToIssue(issue.slug, id);
    }
  }

  return { ...article, id, slug };
}

export async function updateArticle(
  slug: string,
  article: Partial<Omit<Article, "slug" | "id" | "createdBy">> & { newSlug?: string },
) {
  // Find real file using same method as getArticleBySlug
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
    throw new Error(`Article file not found for slug: ${slug}`);
  }

  const fileSlug = file.name.replace(".md", "");
  const existing = await getArticleBySlug(slug);

  if (!existing) {
    throw new Error(`Article ${slug} not found`);
  }

  // Handle slug change if needed
  let finalSlug = fileSlug;
  if (article.newSlug && article.newSlug.trim() !== fileSlug) {
    const baseSlug = article.newSlug.trim();
    finalSlug = await generateUniqueSlug("content/articles", baseSlug, ".md", fileSlug);
  }

  const currentDateTime = new Date().toISOString();

  const newIssueId = article.issueId !== undefined ? article.issueId : existing.issueId;

  const updated: Article = {
    id: existing.id,
    slug: finalSlug,
    title: article.title ?? existing.title,
    date: article.date ?? existing.date,
    last_update: currentDateTime,
    authorId: article.authorId ?? existing.authorId,
    categoryId: article.categoryId ?? existing.categoryId,
    issueId: newIssueId,
    in_evidence: article.in_evidence !== undefined ? article.in_evidence : existing.in_evidence,
    published: article.published !== undefined ? article.published : existing.published,
    excerpt: article.excerpt ?? existing.excerpt,
    content: article.content ?? existing.content,
    podcastId: article.podcastId !== undefined ? article.podcastId : existing.podcastId,
    createdBy: existing.createdBy,
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const frontmatter: Record<string, any> = {
    id: updated.id,
    slug: finalSlug,
    title: updated.title,
    date: updated.date,
    last_update: updated.last_update,
    authorId: updated.authorId,
    categoryId: updated.categoryId,
    in_evidence: updated.in_evidence,
    published: updated.published,
    excerpt: updated.excerpt,
    createdBy: updated.createdBy,
  };

  if (updated.issueId) {
    frontmatter.issueId = updated.issueId;
  }

  if (updated.podcastId) {
    frontmatter.podcastId = updated.podcastId;
  }

  const fileContent = matter.stringify(updated.content, frontmatter);
  const newFilePath = `content/articles/${finalSlug}.md`;
  const oldFilePath = `content/articles/${fileSlug}.md`;

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

  // Sync issue ordering when issueId changes
  const oldIssueId = existing.issueId;
  if (oldIssueId !== newIssueId) {
    if (oldIssueId) {
      const oldIssue = await getIssueById(oldIssueId);
      if (oldIssue) {
        await removeArticleFromIssue(oldIssue.slug, existing.id);
      }
    }
    if (newIssueId) {
      const newIssue = await getIssueById(newIssueId);
      if (newIssue) {
        await addArticleToIssue(newIssue.slug, existing.id);
      }
    }
  }

  return updated;
}

export async function deleteArticle(slug: string) {
  const article = await getArticleBySlug(slug);
  if (!article) {
    throw new Error(`Article ${slug} not found`);
  }

  // Remove from issue ordering before deletion
  if (article.issueId) {
    const issue = await getIssueById(article.issueId);
    if (issue) {
      await removeArticleFromIssue(issue.slug, article.id);
    }
  }

  const filePath = `content/articles/${slug}.md`;
  await deleteFile(filePath, `Delete article: ${slug}`);
}
