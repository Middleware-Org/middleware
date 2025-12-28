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
import { getAllPodcasts } from "@/lib/github/podcasts";
import { cn } from "@/lib/utils/classes";
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

  const [article, categories, authors, issues, podcasts] = await Promise.all([
    getArticleBySlug(slug),
    getAllCategories(),
    getAllAuthors(),
    getAllIssues(),
    getAllPodcasts(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className={cn("h-full flex flex-col", styles.main)}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modifica Articolo: {article.title}</h1>
        <Link href="/admin/articles" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<ArticleEditSkeleton />}>
          <ArticleFormClient
            article={article}
            categories={categories}
            authors={authors}
            issues={issues}
            podcasts={podcasts}
          />
        </Suspense>
      </div>
    </div>
  );
}
