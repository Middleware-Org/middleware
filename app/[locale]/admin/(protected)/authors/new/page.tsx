/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import AuthorFormClient from "../components/AuthorFormClient";
import AuthorFormSkeleton from "../components/AuthorFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Author Page (Server Component)
 **************************************************/
export default async function NewAuthorPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuovo Autore</h1>
        <Link href="/admin/authors" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<AuthorFormSkeleton />}>
        <AuthorFormClient />
      </Suspense>
    </main>
  );
}

