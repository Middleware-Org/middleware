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
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { Plus, ArrowLeft } from "lucide-react";

/* **************************************************
 * Authors List Page (Server Component)
 **************************************************/
export default async function AuthorsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
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
              href="/admin/authors/new"
              className={styles.iconButton}
              aria-label="Nuovo Autore"
              title="Nuovo Autore"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href="/admin"
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

