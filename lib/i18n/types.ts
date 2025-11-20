/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "./consts";
import commonIt from "@/i18n/locales/it/common.json";
import categoriesIt from "@/i18n/locales/it/categories.json";
import authorsIt from "@/i18n/locales/it/authors.json";
import archiveIt from "@/i18n/locales/it/archive.json";
import issueIt from "@/i18n/locales/it/issue.json";

/* **************************************************
 * Types
 **************************************************/
export type TranslationNamespaceKey = keyof typeof TRANSLATION_NAMESPACES;
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[TranslationNamespaceKey];

export type CommonDictionary = typeof commonIt;
export type CategoriesDictionary = typeof categoriesIt;
export type AuthorsDictionary = typeof authorsIt;
export type ArchiveDictionary = typeof archiveIt;
export type IssueDictionary = typeof issueIt;
export type Dictionary = CommonDictionary | CategoriesDictionary | AuthorsDictionary;
export type DictionaryByNamespace<T extends TranslationNamespace> =
  T extends typeof TRANSLATION_NAMESPACES.COMMON
    ? CommonDictionary
    : T extends typeof TRANSLATION_NAMESPACES.CATEGORIES
      ? CategoriesDictionary
      : T extends typeof TRANSLATION_NAMESPACES.AUTHORS
        ? AuthorsDictionary
        : T extends typeof TRANSLATION_NAMESPACES.ARCHIVE
          ? ArchiveDictionary
          : T extends typeof TRANSLATION_NAMESPACES.ISSUE
            ? IssueDictionary
            : never;
