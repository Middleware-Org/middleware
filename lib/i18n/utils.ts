/* **************************************************
 * Imports
 **************************************************/
import { DEFAULT_NAMESPACE } from "@/lib/i18n/consts";
import type { DictionaryByNamespace, TranslationNamespace } from "@/lib/i18n/types";

/* **************************************************
 * Functions
 **************************************************/
export async function getDictionary<T extends TranslationNamespace>(
  locale: string,
  ns: T,
): Promise<DictionaryByNamespace<T>> {
  const file = await import(`@/i18n/locales/${locale}/${ns}.json`);
  return file.default as DictionaryByNamespace<T>;
}

export function normalizeNamespaces(namespaces?: TranslationNamespace | TranslationNamespace[]) {
  if (!namespaces || (Array.isArray(namespaces) && namespaces.length === 0)) {
    return [DEFAULT_NAMESPACE];
  }

  return Array.isArray(namespaces) ? namespaces : [namespaces];
}
