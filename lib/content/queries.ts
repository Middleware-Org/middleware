import { articles, authors, categories, issues } from "@/.velite";

/* **************************************************
 * Issues
 **************************************************/
export const getAllIssues = () => issues.sort((a, b) => b.date.localeCompare(a.date));

export const getIssueBySlug = (slug: string) => issues.find((i) => i.slug === slug);

/* **************************************************
 * Articles
 **************************************************/
export const getAllArticles = () => articles.sort((a, b) => b.date.localeCompare(a.date));

export const getArticleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

export const getArticlesByIssue = (issueSlug: string) =>
  articles.filter((a) => a.issue === issueSlug);

/* **************************************************
 * Categories
 **************************************************/
export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

/* **************************************************
 * Authors
 **************************************************/
export const getAuthorBySlug = (slug: string) => authors.find((a) => a.slug === slug);
