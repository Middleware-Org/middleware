/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllArticles } from "@/lib/github/articles";
import ArticleListClient from "./components/ArticleListClient";
import ArticleListSkeleton from "./components/ArticleListSkeleton";
import styles from "./styles";

/* **************************************************
 * Articles List Page (Server Component)
 **************************************************/
export default async function ArticlesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const articles = await getAllArticles();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Articoli</h1>
        <div className="flex gap-2">
          <Link href="/admin/articles/new" className={styles.submitButton}>
            + Nuovo Articolo
          </Link>
          <Link href="/admin" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>
      </div>

      <Suspense fallback={<ArticleListSkeleton />}>
        <ArticleListClient articles={articles} />
      </Suspense>
    </main>
  );
}
