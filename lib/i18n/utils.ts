/* **************************************************
 * Imports
 **************************************************/
import { cache } from "react";

import { DEFAULT_NAMESPACE } from "@/lib/i18n/consts";
import type { DictionaryByNamespace, TranslationNamespace } from "@/lib/i18n/types";

import { i18nSettings } from "./settings";

/* **************************************************
 * Functions
 **************************************************/
export async function getDictionary<T extends TranslationNamespace>(
  locale: string,
  ns: T,
): Promise<DictionaryByNamespace<T>> {
  return getDictionaryCached(locale, ns) as Promise<DictionaryByNamespace<T>>;
}

const getDictionaryCached = cache(async (locale: string, ns: TranslationNamespace) => {
  const sanitizedLocale = locale?.replace(/[^a-z]/gi, "") || i18nSettings.defaultLocale;

  const validLocale = i18nSettings.locales.includes(sanitizedLocale)
    ? sanitizedLocale
    : i18nSettings.defaultLocale;

  const file = await import(`@/i18n/locales/${validLocale}/${ns}.json`);
  return file.default;
});

export function normalizeNamespaces(namespaces?: TranslationNamespace | TranslationNamespace[]) {
  if (!namespaces || (Array.isArray(namespaces) && namespaces.length === 0)) {
    return [DEFAULT_NAMESPACE];
  }

  return Array.isArray(namespaces) ? namespaces : [namespaces];
}
