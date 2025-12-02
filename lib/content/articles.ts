/* **************************************************
 * Imports
 **************************************************/
import { articles } from "@/.velite";

/* **************************************************
 * Articles
 **************************************************/
export const getAllArticles = () =>
  articles
    .filter((a) => a.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

export const getArticleBySlug = (slug: string) => {
  const article = articles.find((a) => a.slug === slug);
  return article && article.published ? article : undefined;
};

export const getArticlesByIssue = (issueSlug: string) =>
  articles
    .filter((a) => a.issue === issueSlug && a.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

export const getArticlesByCategorySlug = (categorySlug: string) =>
  articles
    .filter((a) => a.category === categorySlug && a.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

export const getArticlesByAuthorSlug = (authorSlug: string) =>
  articles
    .filter((a) => a.author === authorSlug && a.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));
