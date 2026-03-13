import { i18nSettings } from "@/lib/i18n/settings";

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function normalizeLocale(locale?: string): string {
  if (!locale) {
    return i18nSettings.defaultLocale;
  }

  return i18nSettings.locales.includes(locale) ? locale : i18nSettings.defaultLocale;
}

export function stripLocalePrefix(path: string): string {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && i18nSettings.locales.includes(firstSegment)) {
    const next = `/${segments.slice(1).join("/")}`;
    return next === "/" ? "/" : next;
  }

  return normalizedPath;
}

export function withLocale(path: string, locale?: string): string {
  const safeLocale = normalizeLocale(locale);
  const normalizedPath = normalizePath(path);
  const pathWithoutLocale = stripLocalePrefix(normalizedPath);

  if (pathWithoutLocale === "/") {
    return `/${safeLocale}`;
  }

  return `/${safeLocale}${pathWithoutLocale}`;
}
