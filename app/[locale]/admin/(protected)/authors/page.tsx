/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllAuthors } from "@/lib/github/authors";
import AuthorListClient from "./components/AuthorListClient";
import AuthorListSkeleton from "./components/AuthorListSkeleton";
import styles from "./styles";

/* **************************************************
 * Authors List Page (Server Component)
 **************************************************/
export default async function AuthorsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const authors = await getAllAuthors();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Autori</h1>
        <div className="flex gap-2">
          <Link href="/admin/authors/new" className={styles.submitButton}>
            + Nuovo Autore
          </Link>
          <Link href="/admin" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>
      </div>

      <Suspense fallback={<AuthorListSkeleton />}>
        <AuthorListClient authors={authors} />
      </Suspense>
    </main>
  );
}

