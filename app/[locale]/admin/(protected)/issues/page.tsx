/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllIssues } from "@/lib/github/issues";
import IssueListClient from "./components/IssueListClient";
import IssueListSkeleton from "./components/IssueListSkeleton";
import styles from "./styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

/* **************************************************
 * Issues List Page (Server Component)
 **************************************************/
export default async function IssuesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const issues = await getAllIssues();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/issues": issues,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Issues</h1>
          <div className="flex gap-2">
            <Link href="/admin/issues/new" className={styles.submitButton}>
              + Nuova Issue
            </Link>
            <Link href="/admin" className={styles.backButton}>
              ← Indietro
            </Link>
          </div>
        </div>

        <Suspense fallback={<IssueListSkeleton />}>
          <IssueListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}

