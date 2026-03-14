export const TRANSLATION_NAMESPACES = {
  COMMON: "common",
  ADMIN: "admin",
  CATEGORIES: "categories",
  AUTHORS: "authors",
  ARCHIVE: "archive",
  ISSUE: "issue",
  ARTICLE: "article",
  PODCAST: "podcast",
} as const;

export const DEFAULT_NAMESPACE = TRANSLATION_NAMESPACES.COMMON;

export const AVAILABLE_NAMESPACES = Object.values(TRANSLATION_NAMESPACES);
