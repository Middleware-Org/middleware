/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getAdminUser } from "@/lib/auth/server";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import UserFormClient from "../components/UserFormClient";
import UserFormSkeleton from "../components/UserFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New User Page (Server Component)
 **************************************************/
export default async function NewUserPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getAdminUser();
  if (!user) {
    redirect(withLocale("/admin", locale));
  }
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.users.new}</h1>
          <Link href={withLocale("/admin/users", locale)} className={styles.backButton}>
            ← {adminDict.resourcePages.users.back}
          </Link>
        </div>

        <Suspense fallback={<UserFormSkeleton />}>
          <UserFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
