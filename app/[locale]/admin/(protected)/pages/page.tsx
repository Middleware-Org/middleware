/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllPages } from "@/lib/github/pages";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import PageListClient from "./components/PageListClient";
import styles from "./styles";

/* **************************************************
 * Pages List Page (Server Component)
 **************************************************/
export default async function PagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const pages = await getAllPages();
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/pages": pages,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.pages.title}</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/pages/new", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.pages.new}
              title={adminDict.resourcePages.pages.new}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.pages.back}
              title={adminDict.resourcePages.pages.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Suspense
          fallback={<div className={styles.loading}>{adminDict.resourcePages.pages.loading}</div>}
        >
          <PageListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
