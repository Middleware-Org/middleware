import { revalidatePath } from "next/cache";

import { i18nSettings } from "@/lib/i18n/settings";

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function hasLocalePrefix(path: string): boolean {
  return i18nSettings.locales.some(
    (locale) => path === `/${locale}` || path.startsWith(`/${locale}/`),
  );
}

export function revalidateLocalizedPath(path: string) {
  const normalizedPath = normalizePath(path);
  revalidatePath(normalizedPath);

  if (hasLocalePrefix(normalizedPath)) {
    return;
  }

  for (const locale of i18nSettings.locales) {
    revalidatePath(`/${locale}${normalizedPath}`);
  }
}

export function revalidateAdminPath(path: string) {
  revalidateLocalizedPath(path);
  revalidateLocalizedPath("/admin");
}
