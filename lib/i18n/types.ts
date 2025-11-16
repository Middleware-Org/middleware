/* **************************************************
 * Imports
 **************************************************/
import { TRANSLATION_NAMESPACES } from "./consts";
import commonIt from "@/i18n/locales/it/common.json";
import homeIt from "@/i18n/locales/it/home.json";

/* **************************************************
 * Types
 **************************************************/
export type TranslationNamespaceKey = keyof typeof TRANSLATION_NAMESPACES;
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[TranslationNamespaceKey];

export type CommonDictionary = typeof commonIt;
export type HomeDictionary = typeof homeIt;
export type Dictionary = CommonDictionary | HomeDictionary;
export type DictionaryByNamespace<T extends TranslationNamespace> =
  T extends typeof TRANSLATION_NAMESPACES.COMMON
    ? CommonDictionary
    : T extends typeof TRANSLATION_NAMESPACES.HOME
      ? HomeDictionary
      : never;
