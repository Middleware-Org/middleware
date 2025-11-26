/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllUsers } from "@/lib/github/users";
import UserListClient from "./components/UserListClient";
import UserListSkeleton from "./components/UserListSkeleton";
import styles from "./styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

/* **************************************************
 * Users List Page (Server Component)
 **************************************************/
export default async function UsersPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const users = await getAllUsers();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/users": users,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Utenti</h1>
          <div className="flex gap-2">
            <Link href="/admin/users/new" className={styles.submitButton}>
              + Nuovo Utente
            </Link>
            <Link href="/admin" className={styles.backButton}>
              ← Indietro
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

