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
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * New Category Page (Server Component)
 **************************************************/
export default async function NewCategoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuova Categoria</h1>
          <Link href={withLocale("/admin/categories", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<CategoryFormSkeleton />}>
          <CategoryFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
