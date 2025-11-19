/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "./consts";
import commonIt from "@/i18n/locales/it/common.json";
import categoriesIt from "@/i18n/locales/it/categories.json";

/* **************************************************
 * Types
 **************************************************/
export type TranslationNamespaceKey = keyof typeof TRANSLATION_NAMESPACES;
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[TranslationNamespaceKey];

export type CommonDictionary = typeof commonIt;
export type CategoriesDictionary = typeof categoriesIt;
export type Dictionary = CommonDictionary | CategoriesDictionary;
export type DictionaryByNamespace<T extends TranslationNamespace> =
  T extends typeof TRANSLATION_NAMESPACES.COMMON
    ? CommonDictionary
    : T extends typeof TRANSLATION_NAMESPACES.CATEGORIES
      ? CategoriesDictionary
      : never;
