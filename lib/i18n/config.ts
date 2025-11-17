/* **************************************************
 * Imports
 **************************************************/
import path from "path";
import Backend from "i18next-fs-backend";
import { createInstance, i18n as I18NextInstance, InitOptions } from "i18next";

import { AVAILABLE_NAMESPACES, DEFAULT_NAMESPACE } from "./consts";
import { TranslationNamespace } from "./types";
import { normalizeNamespaces } from "./utils";
import { i18nSettings } from "./settings";

/* **************************************************
 * Constants
 **************************************************/
const backendLoadPath = path.join(process.cwd(), "i18n/locales/{{lng}}/{{ns}}.json");

const sharedConfig: InitOptions = {
  fallbackLng: i18nSettings.defaultLocale,
  supportedLngs: i18nSettings.locales,
  defaultNS: DEFAULT_NAMESPACE,
  ns: AVAILABLE_NAMESPACES,
  backend: { loadPath: backendLoadPath },
  preload: i18nSettings.locales,
  interpolation: { escapeValue: false },
  returnObjects: true,
};

/* **************************************************
 * i18n Instance Cache
 **************************************************/
const i18nInstanceCache = new Map<string, Promise<I18NextInstance>>();

/* **************************************************
 * Functions
 **************************************************/
async function createI18n(locale: string) {
  const instance = createInstance();

  await instance.use(Backend).init({
    ...sharedConfig,
    lng: locale,
  });

  return instance;
}

async function getOrCreateInstance(locale: string) {
  if (!i18nInstanceCache.has(locale)) {
    i18nInstanceCache.set(locale, createI18n(locale));
  }

  return i18nInstanceCache.get(locale)!;
}

export async function initI18nServer(
  locale: string,
  namespaces?: TranslationNamespace | TranslationNamespace[],
) {
  const normalizedNamespaces = normalizeNamespaces(namespaces);
  const i18nInstance = await getOrCreateInstance(locale);

  await i18nInstance.loadNamespaces(normalizedNamespaces);

  return i18nInstance;
}

