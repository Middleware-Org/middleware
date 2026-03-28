/* **************************************************
 * Imports
 **************************************************/
import { articles, issues, authors, categories } from "@/.velite";

const safeArticles = Array.isArray(articles) ? articles : [];
const safeIssues = Array.isArray(issues) ? issues : [];
const safeAuthors = Array.isArray(authors) ? authors : [];
const safeCategories = Array.isArray(categories) ? categories : [];

type ArticleItem = (typeof safeArticles)[number];

const publishedIssuesBySlug = new Map(
  safeIssues.filter((issue) => issue.published).map((issue) => [issue.slug, issue]),
);

const publishedArticlesSorted = safeArticles
  .filter((article) => article.published)
  .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

const publishedArticleBySlug = new Map(
  publishedArticlesSorted.map((article) => [article.slug, article]),
);

const publishedArticlesByCategoryId = new Map<string, ArticleItem[]>();
const publishedArticlesByAuthorId = new Map<string, ArticleItem[]>();
const publishedArticlesByIssueId = new Map<string, ArticleItem[]>();
const publishedArticleByPodcastId = new Map<string, ArticleItem>();

for (const article of publishedArticlesSorted) {
  if (article.categoryId) {
    const categoryArticles = publishedArticlesByCategoryId.get(article.categoryId) ?? [];
    categoryArticles.push(article);
    publishedArticlesByCategoryId.set(article.categoryId, categoryArticles);
  }

  if (article.authorId) {
    const authorArticles = publishedArticlesByAuthorId.get(article.authorId) ?? [];
    authorArticles.push(article);
    publishedArticlesByAuthorId.set(article.authorId, authorArticles);
  }

  if (article.issueId) {
    const issueArticles = publishedArticlesByIssueId.get(article.issueId) ?? [];
    issueArticles.push(article);
    publishedArticlesByIssueId.set(article.issueId, issueArticles);
  }

  if (article.podcastId && !publishedArticleByPodcastId.has(article.podcastId)) {
    publishedArticleByPodcastId.set(article.podcastId, article);
  }
}

const orderedArticlesByIssueSlug = new Map<string, ArticleItem[]>();

for (const issue of publishedIssuesBySlug.values()) {
  const issueArticles = publishedArticlesByIssueId.get(issue.id) ?? [];
  const orderedIds = issue.articlesOrder ?? [];
  const issueArticleById = new Map(issueArticles.map((article) => [article.id, article]));

  const ordered = orderedIds
    .map((articleId) => issueArticleById.get(articleId))
    .filter(Boolean) as ArticleItem[];
  const unordered = issueArticles.filter((article) => !orderedIds.includes(article.id));

  orderedArticlesByIssueSlug.set(issue.slug, [...ordered, ...unordered]);
}

/* **************************************************
 * Articles
 **************************************************/
export const getAllArticles = () => publishedArticlesSorted;

export const getArticleBySlug = (slug: string) => publishedArticleBySlug.get(slug);

export const getArticleByPodcastId = (podcastId: string) =>
  publishedArticleByPodcastId.get(podcastId);

export const getArticlesByIssue = (issueSlug: string) => {
  const issue = publishedIssuesBySlug.get(issueSlug);
  if (!issue) return [];

  return orderedArticlesByIssueSlug.get(issue.slug) ?? [];
};

export function splitArticlesByEvidence(articleList: typeof articles) {
  const evidenceIndex = articleList.findIndex((a) => a.in_evidence);
  if (evidenceIndex === -1) {
    return { articleInEvidence: articleList[0], otherArticles: articleList.slice(1) };
  }
  return {
    articleInEvidence: articleList[evidenceIndex],
    otherArticles: articleList.filter((_, i) => i !== evidenceIndex),
  };
}

export const getArticlesByCategorySlug = (categorySlug: string) => {
  const category = safeCategories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return publishedArticlesByCategoryId.get(category.id) ?? [];
};

export const getArticlesByAuthorSlug = (authorSlug: string) => {
  const author = safeAuthors.find((a) => a.slug === authorSlug);
  if (!author) return [];
  return publishedArticlesByAuthorId.get(author.id) ?? [];
};
