/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getAdminUser } from "@/lib/auth/server";
import { getUserById } from "@/lib/github/users";
import { withLocale } from "@/lib/i18n/path";

import UserEditSkeleton from "../../components/UserEditSkeleton";
import UserFormClient from "../../components/UserFormClient";
import styles from "../../styles";


/* **************************************************
 * Types
 **************************************************/
interface EditUserPageProps {
  params: Promise<{ locale: string; id: string }>;
}

/* **************************************************
 * Edit User Page (Server Component)
 **************************************************/
export default async function EditUserPage({ params }: EditUserPageProps) {
  const { locale, id } = await params;
  const user = await getAdminUser();
  if (!user) {
    redirect(withLocale("/admin", locale));
  }
  const userData = await getUserById(id);

  if (!userData) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/users/${id}`]: userData,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Utente: {userData.email}</h1>
          <Link href={withLocale("/admin/users", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<UserEditSkeleton />}>
          <UserFormClient userId={id} />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
