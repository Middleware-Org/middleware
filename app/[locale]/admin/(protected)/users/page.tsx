/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/server";
import { getAllUsers } from "@/lib/github/users";
import UserListClient from "./components/UserListClient";
import UserListSkeleton from "./components/UserListSkeleton";
import styles from "./styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";
import { Plus, ArrowLeft } from "lucide-react";

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
            <Link
              href={withLocale("/admin/users/new", locale)}
              className={styles.iconButton}
              aria-label="Nuovo Utente"
              title="Nuovo Utente"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label="Indietro"
              title="Indietro"
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
