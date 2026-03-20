import { initI18nServer } from "./config";
import type { TranslationNamespace } from "./types";
import { normalizeNamespaces } from "./utils";

export async function getTranslation(
  locale: string,
  namespaces?: TranslationNamespace | TranslationNamespace[],
) {
  const normalized = normalizeNamespaces(namespaces);
  const i18n = await initI18nServer(locale, normalized);

  return i18n.getFixedT(locale, normalized);
}
