/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getArticleBySlug } from "@/lib/github/articles";
import { getAllCategories } from "@/lib/github/categories";
import { getAllAuthors } from "@/lib/github/authors";
import { getAllIssues } from "@/lib/github/issues";
import ArticleFormClient from "../../components/ArticleFormClient";
import ArticleEditSkeleton from "../../components/ArticleEditSkeleton";
import styles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface EditArticlePageProps {
  params: Promise<{ slug: string }>;
}

/* **************************************************
 * Edit Article Page (Server Component)
 **************************************************/
export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { slug } = await params;

  const [article, categories, authors, issues] = await Promise.all([
    getArticleBySlug(slug),
    getAllCategories(),
    getAllAuthors(),
    getAllIssues(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modifica Articolo: {article.title}</h1>
        <Link href="/admin/articles" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<ArticleEditSkeleton />}>
        <ArticleFormClient
          article={article}
          categories={categories}
          authors={authors}
          issues={issues}
        />
      </Suspense>
    </main>
  );
}
