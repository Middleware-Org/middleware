/* **************************************************
 * Imports
 **************************************************/
import type adminIt from "@/i18n/locales/it/admin.json";
import type archiveIt from "@/i18n/locales/it/archive.json";
import type articleIt from "@/i18n/locales/it/article.json";
import type authorsIt from "@/i18n/locales/it/authors.json";
import type categoriesIt from "@/i18n/locales/it/categories.json";
import type commonIt from "@/i18n/locales/it/common.json";
import type issueIt from "@/i18n/locales/it/issue.json";
import type podcastIt from "@/i18n/locales/it/podcast.json";

import type { TRANSLATION_NAMESPACES } from "./consts";

/* **************************************************
 * Types
 **************************************************/
export type TranslationNamespaceKey = keyof typeof TRANSLATION_NAMESPACES;
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[TranslationNamespaceKey];

export type CommonDictionary = typeof commonIt;
export type AdminDictionary = typeof adminIt;
export type CategoriesDictionary = typeof categoriesIt;
export type AuthorsDictionary = typeof authorsIt;
export type ArchiveDictionary = typeof archiveIt;
export type IssueDictionary = typeof issueIt;
export type ArticleDictionary = typeof articleIt;
export type PodcastDictionary = typeof podcastIt;

export type Dictionary =
  | CommonDictionary
  | AdminDictionary
  | CategoriesDictionary
  | AuthorsDictionary
  | ArchiveDictionary
  | IssueDictionary
  | ArticleDictionary
  | PodcastDictionary;
export type DictionaryByNamespace<T extends TranslationNamespace> =
  T extends typeof TRANSLATION_NAMESPACES.COMMON
    ? CommonDictionary
    : T extends typeof TRANSLATION_NAMESPACES.ADMIN
      ? AdminDictionary
      : T extends typeof TRANSLATION_NAMESPACES.CATEGORIES
        ? CategoriesDictionary
        : T extends typeof TRANSLATION_NAMESPACES.AUTHORS
          ? AuthorsDictionary
          : T extends typeof TRANSLATION_NAMESPACES.ARCHIVE
            ? ArchiveDictionary
            : T extends typeof TRANSLATION_NAMESPACES.ISSUE
              ? IssueDictionary
              : T extends typeof TRANSLATION_NAMESPACES.ARTICLE
                ? ArticleDictionary
                : T extends typeof TRANSLATION_NAMESPACES.PODCAST
                  ? PodcastDictionary
                  : never;
