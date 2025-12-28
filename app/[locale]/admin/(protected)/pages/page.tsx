/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllPages } from "@/lib/github/pages";
import PageListClient from "./components/PageListClient";
import styles from "./styles";
import { Plus, ArrowLeft } from "lucide-react";

/* **************************************************
 * Pages List Page (Server Component)
 **************************************************/
export default async function PagesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const pages = await getAllPages();

  return (
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Pagine</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/pages/new"
              className={styles.iconButton}
              aria-label="Nuova Pagina"
              title="Nuova Pagina"
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

        <Suspense fallback={<div className={styles.loading}>Caricamento pagine...</div>}>
          <PageListClient initialPages={pages} />
        </Suspense>
      </main>
  );
}
