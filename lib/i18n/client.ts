"use client";

import { useParams } from "next/navigation";
import { withLocale } from "@/lib/i18n/path";

export function useLocalizedPath() {
  const { locale } = useParams() as { locale?: string };

  return (path: string) => withLocale(path, locale);
}
