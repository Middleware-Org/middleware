/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/github/categories";
import { getAllAuthors } from "@/lib/github/authors";
import { getAllIssues } from "@/lib/github/issues";
import { cn } from "@/lib/utils/classes";
import ArticleFormClient from "../components/ArticleFormClient";
import ArticleFormSkeleton from "../components/ArticleFormSkeleton";
import styles from "../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

/* **************************************************
 * New Article Page (Server Component)
 **************************************************/
export default async function NewArticlePage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const [categories, authors, issues] = await Promise.all([
    getAllCategories(),
    getAllAuthors(),
    getAllIssues(),
  ]);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/categories": categories,
    "/api/authors": authors,
    "/api/issues": issues,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuovo Articolo</h1>
          <Link href="/admin/articles" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<ArticleFormSkeleton />}>
            <ArticleFormClient />
          </Suspense>
        </div>
      </div>
    </SWRPageProvider>
  );
}
