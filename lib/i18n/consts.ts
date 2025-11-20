export const TRANSLATION_NAMESPACES = {
  COMMON: "common",
  HOME: "home",
  CATEGORIES: "categories",
  AUTHORS: "authors",
  ARCHIVE: "archive",
  ISSUE: "issue",
} as const;

export const DEFAULT_NAMESPACE = TRANSLATION_NAMESPACES.COMMON;

export const AVAILABLE_NAMESPACES = Object.values(TRANSLATION_NAMESPACES);
