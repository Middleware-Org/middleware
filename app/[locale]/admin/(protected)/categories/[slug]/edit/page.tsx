/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getCategoryBySlug } from "@/lib/github/categories";
import { withLocale } from "@/lib/i18n/path";

import CategoryEditSkeleton from "../../components/CategoryEditSkeleton";
import CategoryFormClient from "../../components/CategoryFormClient";
import styles from "../../styles";


/* **************************************************
 * Types
 **************************************************/
interface EditCategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Edit Category Page (Server Component)
 **************************************************/
export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
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
          <Link href={withLocale("/admin/categories", locale)} className={styles.backButton}>
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
