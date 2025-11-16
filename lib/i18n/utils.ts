import { DEFAULT_NAMESPACE } from "./consts";
import { TranslationNamespace } from "./types";

export async function getDictionary(locale: string, ns: TranslationNamespace) {
  const file = await import(`@/i18n/locales/${locale}/${ns}.json`);
  return file.default;
}

export function normalizeNamespaces(namespaces?: TranslationNamespace | TranslationNamespace[]) {
  if (!namespaces || (Array.isArray(namespaces) && namespaces.length === 0)) {
    return [DEFAULT_NAMESPACE];
  }

  return Array.isArray(namespaces) ? namespaces : [namespaces];
}
