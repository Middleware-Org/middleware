/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllIssues } from "@/lib/github/issues";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import IssueListClient from "./components/IssueListClient";
import IssueListSkeleton from "./components/IssueListSkeleton";
import styles from "./styles";

/* **************************************************
 * Issues List Page (Server Component)
 **************************************************/
export default async function IssuesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const issues = await getAllIssues();
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/issues": issues,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.issues.title}</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/issues/new", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.issues.new}
              title={adminDict.resourcePages.issues.new}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.issues.back}
              title={adminDict.resourcePages.issues.back}
            >
              <ArrowLeft className="w-4 h-4" />
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
