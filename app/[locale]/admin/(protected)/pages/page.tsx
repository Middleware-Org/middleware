/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllPages } from "@/lib/github/pages";
import PageListClient from "./components/PageListClient";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import styles from "./styles";

/* **************************************************
 * Pages List Page (Server Component)
 **************************************************/
export default async function PagesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const pages = await getAllPages();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/pages": pages,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Pagine</h1>
          <div className="flex gap-2">
            <Link href="/admin/pages/new" className={styles.submitButton}>
              + Nuova Pagina
            </Link>
            <Link href="/admin" className={styles.backButton}>
              ← Indietro
            </Link>
          </div>
        </div>

        <Suspense fallback={<div className={styles.loading}>Caricamento pagine...</div>}>
          <PageListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}

