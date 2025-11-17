/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAuthorBySlug } from "@/lib/github/authors";
import AuthorFormClient from "../../components/AuthorFormClient";
import AuthorDeleteButton from "../../components/AuthorDeleteButton";
import AuthorEditSkeleton from "../../components/AuthorEditSkeleton";
import styles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface EditAuthorPageProps {
  params: Promise<{ slug: string }>;
}

/* **************************************************
 * Edit Author Page (Server Component)
 **************************************************/
export default async function EditAuthorPage({ params }: EditAuthorPageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modifica Autore: {author.name}</h1>
        <Link href="/admin/authors" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<AuthorEditSkeleton />}>
        <AuthorFormClient author={author} />
        <div className="mt-6">
          <AuthorDeleteButton author={author} />
        </div>
      </Suspense>
    </main>
  );
}

