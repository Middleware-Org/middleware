/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllArticles } from "@/lib/github/articles";
import { getAllAuthors } from "@/lib/github/authors";
import { getAllCategories } from "@/lib/github/categories";
import { getAllIssues } from "@/lib/github/issues";
import ArticleListClient from "./components/ArticleListClient";
import ArticleListSkeleton from "./components/ArticleListSkeleton";
import styles from "./styles";
import { Plus, ArrowLeft } from "lucide-react";

/* **************************************************
 * Articles List Page (Server Component)
 **************************************************/
export default async function ArticlesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Fetch all data in parallel
  const [articles, authors, categories, issues] = await Promise.all([
    getAllArticles(),
    getAllAuthors(),
    getAllCategories(),
    getAllIssues(),
  ]);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Articoli</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/articles/new"
            className={styles.iconButton}
            aria-label="Nuovo Articolo"
            title="Nuovo Articolo"
          >
            <Plus className="w-4 h-4" />
          </Link>
          <Link
            href="/admin"
            className={styles.iconButton}
            aria-label="Indietro"
            title="Indietro"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Suspense fallback={<ArticleListSkeleton />}>
        <ArticleListClient
          initialArticles={articles}
          initialAuthors={authors}
          initialCategories={categories}
          initialIssues={issues}
        />
      </Suspense>
    </main>
  );
}
