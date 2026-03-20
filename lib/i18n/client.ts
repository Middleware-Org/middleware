"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";

import { withLocale } from "@/lib/i18n/path";

export function useLocalizedPath() {
  const { locale } = useParams() as { locale?: string };

  return useCallback((path: string) => withLocale(path, locale), [locale]);
}
