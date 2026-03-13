/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/server";
import UserFormClient from "../components/UserFormClient";
import UserFormSkeleton from "../components/UserFormSkeleton";
import styles from "../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * New User Page (Server Component)
 **************************************************/
export default async function NewUserPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getAdminUser();
  if (!user) {
    redirect(withLocale("/admin", locale));
  }

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuovo Utente</h1>
          <Link href={withLocale("/admin/users", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<UserFormSkeleton />}>
          <UserFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
