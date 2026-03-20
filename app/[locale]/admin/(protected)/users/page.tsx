/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getAdminUser } from "@/lib/auth/server";
import { getAllUsers } from "@/lib/github/users";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import UserListClient from "./components/UserListClient";
import UserListSkeleton from "./components/UserListSkeleton";
import styles from "./styles";

/* **************************************************
 * Users List Page (Server Component)
 **************************************************/
export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getAdminUser();
  if (!user) {
    redirect(withLocale("/admin", locale));
  }

  const users = await getAllUsers();
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/users": users,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.users.title}</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/users/new", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.users.new}
              title={adminDict.resourcePages.users.new}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.users.back}
              title={adminDict.resourcePages.users.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Suspense fallback={<UserListSkeleton />}>
          <UserListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
