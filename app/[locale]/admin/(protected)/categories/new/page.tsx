/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import CategoryFormClient from "../components/CategoryFormClient";
import CategoryFormSkeleton from "../components/CategoryFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Category Page (Server Component)
 **************************************************/
export default async function NewCategoryPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuova Categoria</h1>
        <Link href="/admin/categories" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<CategoryFormSkeleton />}>
        <CategoryFormClient />
      </Suspense>
    </main>
  );
}
