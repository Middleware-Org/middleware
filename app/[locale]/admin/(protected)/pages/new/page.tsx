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
import { cn } from "@/lib/utils/classes";

import PageFormClient from "../components/PageFormClient";
import PageFormSkeleton from "../components/PageFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Page (Server Component)
 **************************************************/
export default async function NewPagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  return (
    <SWRPageProvider fallback={{}}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.pages.new}</h1>
          <Link href={withLocale("/admin/pages", locale)} className={styles.backButton}>
            ← {adminDict.resourcePages.pages.back}
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<PageFormSkeleton />}>
            <PageFormClient />
          </Suspense>
        </div>
      </div>
    </SWRPageProvider>
  );
}
