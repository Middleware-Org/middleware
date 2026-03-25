/* **************************************************
 * Imports
 **************************************************/
import { articles, issues, authors, categories } from "@/.velite";

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

export const getArticleByPodcastId = (podcastId: string) => {
  return getAllArticles().find((article) => article.podcastId === podcastId);
};

export const getArticlesByIssue = (issueSlug: string) => {
  const issue = issues.find((i) => i.slug === issueSlug && i.published);
  if (!issue) return [];

  const issueArticles = articles.filter((a) => a.issueId === issue.id && a.published);
  const orderedIds = issue.articlesOrder || [];

  const articleMap = new Map(issueArticles.map((a) => [a.id, a]));
  const ordered = orderedIds
    .map((id) => articleMap.get(id))
    .filter(Boolean) as typeof issueArticles;
  const unordered = issueArticles.filter((a) => !orderedIds.includes(a.id));

  return [...ordered, ...unordered];
};

export const getArticlesByCategorySlug = (categorySlug: string) => {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return articles
    .filter((a) => a.categoryId === category.id && a.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));
};

export const getArticlesByAuthorSlug = (authorSlug: string) => {
  const author = authors.find((a) => a.slug === authorSlug);
  if (!author) return [];
  return articles
    .filter((a) => a.authorId === author.id && a.published)
    .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));
};
