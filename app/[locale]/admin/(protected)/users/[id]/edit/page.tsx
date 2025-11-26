/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getUserById } from "@/lib/github/users";
import UserFormClient from "../../components/UserFormClient";
import UserEditSkeleton from "../../components/UserEditSkeleton";
import styles from "../../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

/* **************************************************
 * Types
 **************************************************/
interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

/* **************************************************
 * Edit User Page (Server Component)
 **************************************************/
export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
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
          <Link href="/admin/users" className={styles.backButton}>
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

