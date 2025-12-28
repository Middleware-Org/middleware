/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { ArticleService, IssueService, CategoryService, AuthorService } from "@/lib/services";
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

  // Fetch dei dati con cache Next.js tramite Services
  const [articles, issues, categories, authors] = await Promise.all([
    ArticleService.getAll(),
    IssueService.getAll(),
    CategoryService.getAll(),
    AuthorService.getAll(),
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
          initialIssues={issues}
          initialCategories={categories}
          initialAuthors={authors}
        />
      </Suspense>
    </main>
  );
}
