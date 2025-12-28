/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import UserFormClient from "../components/UserFormClient";
import UserFormSkeleton from "../components/UserFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New User Page (Server Component)
 **************************************************/
export default async function NewUserPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuovo Utente</h1>
          <Link href="/admin/users" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<UserFormSkeleton />}>
          <UserFormClient />
        </Suspense>
      </main>
  );
}

