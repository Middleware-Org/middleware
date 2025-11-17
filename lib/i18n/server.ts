import { initI18nServer } from "./config";
import { normalizeNamespaces } from "./utils";
import { TranslationNamespace } from "./types";

export async function getTranslation(
  locale: string,
  namespaces?: TranslationNamespace | TranslationNamespace[],
) {
  const normalized = normalizeNamespaces(namespaces);
  const i18n = await initI18nServer(locale, normalized);

  return i18n.getFixedT(locale, normalized);
}
