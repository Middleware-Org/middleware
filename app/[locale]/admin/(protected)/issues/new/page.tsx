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
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * New Issue Page (Server Component)
 **************************************************/
export default async function NewIssuePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuova Issue</h1>
          <Link href={withLocale("/admin/issues", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<IssueFormSkeleton />}>
          <IssueFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
