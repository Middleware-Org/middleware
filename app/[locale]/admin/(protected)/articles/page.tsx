/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllArticles } from "@/lib/github/articles";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import ArticleListClient from "./components/ArticleListClient";
import ArticleListSkeleton from "./components/ArticleListSkeleton";
import styles from "./styles";

/* **************************************************
 * Articles List Page (Server Component)
 **************************************************/
export default async function ArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const articles = await getAllArticles();
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/articles": articles,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.articles.title}</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/articles/new", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.articles.new}
              title={adminDict.resourcePages.articles.new}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.articles.back}
              title={adminDict.resourcePages.articles.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Suspense fallback={<ArticleListSkeleton />}>
          <ArticleListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
