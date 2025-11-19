/* **************************************************
 * Imports
 **************************************************/
import { articles } from "@/.velite";

/* **************************************************
 * Articles
 **************************************************/
export const getAllArticles = () => articles.sort((a, b) => b.date.localeCompare(a.date));

export const getArticleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

export const getArticlesByIssue = (issueSlug: string) =>
  articles.filter((a) => a.issue === issueSlug);

export const getArticlesByCategorySlug = (categorySlug: string) =>
  articles.filter((a) => a.category === categorySlug);

export const getArticlesByAuthorSlug = (authorSlug: string) =>
  articles.filter((a) => a.author === authorSlug);
