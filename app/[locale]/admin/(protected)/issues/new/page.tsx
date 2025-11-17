/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import IssueFormClient from "../components/IssueFormClient";
import IssueFormSkeleton from "../components/IssueFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Issue Page (Server Component)
 **************************************************/
export default async function NewIssuePage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuova Issue</h1>
        <Link href="/admin/issues" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<IssueFormSkeleton />}>
        <IssueFormClient />
      </Suspense>
    </main>
  );
}

