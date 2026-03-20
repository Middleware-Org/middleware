/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getArticleBySlug } from "@/lib/github/articles";
import { getAllAuthors } from "@/lib/github/authors";
import { getAllCategories } from "@/lib/github/categories";
import { getAllIssues } from "@/lib/github/issues";
import { withLocale } from "@/lib/i18n/path";
import { cn } from "@/lib/utils/classes";

import ArticleEditSkeleton from "../../components/ArticleEditSkeleton";
import ArticleFormClient from "../../components/ArticleFormClient";
import styles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface EditArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Edit Article Page (Server Component)
 **************************************************/
export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { locale, slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const [article, categories, authors, issues] = await Promise.all([
    getArticleBySlug(slug),
    getAllCategories(),
    getAllAuthors(),
    getAllIssues(),
  ]);

  if (!article) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/articles/${slug}`]: article,
    "/api/categories": categories,
    "/api/authors": authors,
    "/api/issues": issues,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Articolo: {article.title}</h1>
          <Link href={withLocale("/admin/articles", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<ArticleEditSkeleton />}>
            <ArticleFormClient articleSlug={slug} />
          </Suspense>
        </div>
      </div>
    </SWRPageProvider>
  );
}
