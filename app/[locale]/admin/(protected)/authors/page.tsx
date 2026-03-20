/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllAuthors } from "@/lib/github/authors";
import { withLocale } from "@/lib/i18n/path";

import AuthorListClient from "./components/AuthorListClient";
import AuthorListSkeleton from "./components/AuthorListSkeleton";
import styles from "./styles";


/* **************************************************
 * Authors List Page (Server Component)
 **************************************************/
export default async function AuthorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const authors = await getAllAuthors();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/authors": authors,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Autori</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/authors/new", locale)}
              className={styles.iconButton}
              aria-label="Nuovo Autore"
              title="Nuovo Autore"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label="Indietro"
              title="Indietro"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Suspense fallback={<AuthorListSkeleton />}>
          <AuthorListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
