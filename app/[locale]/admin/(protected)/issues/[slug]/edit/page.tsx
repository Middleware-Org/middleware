/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getIssueBySlug } from "@/lib/github/issues";
import IssueFormClient from "../../components/IssueFormClient";
import IssueEditSkeleton from "../../components/IssueEditSkeleton";
import styles from "../../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * Types
 **************************************************/
interface EditIssuePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Edit Issue Page (Server Component)
 **************************************************/
export default async function EditIssuePage({ params }: EditIssuePageProps) {
  const { locale, slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const issue = await getIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/issues/${slug}`]: issue,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Issue: {issue.title}</h1>
          <Link href={withLocale("/admin/issues", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<IssueEditSkeleton />}>
          <IssueFormClient issueSlug={slug} />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
