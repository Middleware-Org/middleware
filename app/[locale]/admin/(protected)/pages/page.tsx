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
import { withLocale } from "@/lib/i18n/path";
import { Plus, ArrowLeft } from "lucide-react";

/* **************************************************
 * Pages List Page (Server Component)
 **************************************************/
export default async function PagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
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
            <Link
              href={withLocale("/admin/pages/new", locale)}
              className={styles.iconButton}
              aria-label="Nuova Pagina"
              title="Nuova Pagina"
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

        <Suspense fallback={<div className={styles.loading}>Caricamento pagine...</div>}>
          <PageListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
