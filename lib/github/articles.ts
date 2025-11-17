/* **************************************************
 * Imports
 **************************************************/
import matter from "gray-matter";
import { getFileContent, listDirectoryFiles } from "./client";
import type { Article } from "./types";

/* **************************************************
 * Articles
 ************************************************** */
export async function getAllArticles(): Promise<Article[]> {
  const files = await listDirectoryFiles("content/articles");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const articles = await Promise.all(
    mdFiles.map(async (file) => {
      const content = await getFileContent(file.path);
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
    }),
  );

  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  try {
    const files = await listDirectoryFiles("content/articles");
    const file = files.find((f) => f.name === `${slug}.md` || f.name.replace(".md", "") === slug);

    if (!file) {
      return undefined;
    }

    const content = await getFileContent(file.path);
    const { data, content: markdownContent } = matter(content);

    return {
      slug: data.slug || slug,
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
    return undefined;
  }
}

export async function getArticlesByIssue(issueSlug: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.issue === issueSlug);
}

