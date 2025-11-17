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
import ArticleFormClient from "../components/ArticleFormClient";
import ArticleFormSkeleton from "../components/ArticleFormSkeleton";
import styles from "../styles";

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

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuovo Articolo</h1>
        <Link href="/admin/articles" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<ArticleFormSkeleton />}>
        <ArticleFormClient categories={categories} authors={authors} issues={issues} />
      </Suspense>
    </main>
  );
}
