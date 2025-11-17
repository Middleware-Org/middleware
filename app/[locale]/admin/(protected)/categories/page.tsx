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

/* **************************************************
 * Categories List Page (Server Component)
 **************************************************/
export default async function CategoriesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const categories = await getAllCategories();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Categorie</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories/new" className={styles.submitButton}>
            + Nuova Categoria
          </Link>
          <Link href="/admin" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>
      </div>

      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryListClient categories={categories} />
      </Suspense>
    </main>
  );
}
