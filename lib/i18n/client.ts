"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { withLocale } from "@/lib/i18n/path";

export function useLocalizedPath() {
  const { locale } = useParams() as { locale?: string };

  return useCallback((path: string) => withLocale(path, locale), [locale]);
}
