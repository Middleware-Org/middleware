/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/github/categories";
import CategoryListClient from "./components/CategoryListClient";
import CategoryListSkeleton from "./components/CategoryListSkeleton";
import styles from "./styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { ExternalLink, Plus, ArrowLeft } from "lucide-react";

/* **************************************************
 * Categories List Page (Server Component)
 **************************************************/
export default async function CategoriesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const categories = await getAllCategories();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/categories": categories,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Categorie</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/categories/new"
              className={styles.iconButton}
              aria-label="Nuova Categoria"
              title="Nuova Categoria"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href="/categories"
              className={styles.iconButton}
              target="_blank"
              aria-label="Anteprima"
              title="Anteprima"
            >
              <ExternalLink className="w-4 h-4" />
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

        <Suspense fallback={<CategoryListSkeleton />}>
          <CategoryListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
