/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getCategoryBySlug } from "@/lib/github/categories";
import CategoryFormClient from "../../components/CategoryFormClient";
import CategoryEditSkeleton from "../../components/CategoryEditSkeleton";
import styles from "../../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

/* **************************************************
 * Types
 **************************************************/
interface EditCategoryPageProps {
  params: Promise<{ slug: string }>;
}

/* **************************************************
 * Edit Category Page (Server Component)
 **************************************************/
export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/categories/${slug}`]: category,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modifica Categoria: {category.name}</h1>
        <Link href="/admin/categories" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<CategoryEditSkeleton />}>
          <CategoryFormClient categorySlug={slug} />
      </Suspense>
    </main>
    </SWRPageProvider>
  );
}
