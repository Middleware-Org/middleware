/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllCategories } from "@/lib/github/categories";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import CategoryListClient from "./components/CategoryListClient";
import CategoryListSkeleton from "./components/CategoryListSkeleton";
import styles from "./styles";

/* **************************************************
 * Categories List Page (Server Component)
 **************************************************/
export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const categories = await getAllCategories();
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/categories": categories,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.categories.title}</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/categories/new", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.categories.new}
              title={adminDict.resourcePages.categories.new}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.categories.back}
              title={adminDict.resourcePages.categories.back}
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
