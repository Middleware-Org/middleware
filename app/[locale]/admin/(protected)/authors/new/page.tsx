/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { withLocale } from "@/lib/i18n/path";

import AuthorFormClient from "../components/AuthorFormClient";
import AuthorFormSkeleton from "../components/AuthorFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Author Page (Server Component)
 **************************************************/
export default async function NewAuthorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuovo Autore</h1>
          <Link href={withLocale("/admin/authors", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<AuthorFormSkeleton />}>
          <AuthorFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
