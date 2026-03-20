/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import CategoryFormClient from "../components/CategoryFormClient";
import CategoryFormSkeleton from "../components/CategoryFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Category Page (Server Component)
 **************************************************/
export default async function NewCategoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.categories.new}</h1>
          <Link href={withLocale("/admin/categories", locale)} className={styles.backButton}>
            ← {adminDict.resourcePages.categories.back}
          </Link>
        </div>

        <Suspense fallback={<CategoryFormSkeleton />}>
          <CategoryFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
