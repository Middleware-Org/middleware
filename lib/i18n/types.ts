import { TRANSLATION_NAMESPACES } from "./consts";

export type TranslationNamespaceKey = keyof typeof TRANSLATION_NAMESPACES;
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[TranslationNamespaceKey];
