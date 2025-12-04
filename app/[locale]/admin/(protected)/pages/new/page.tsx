/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { cn } from "@/lib/utils/classes";
import PageFormClient from "../components/PageFormClient";
import PageFormSkeleton from "../components/PageFormSkeleton";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import styles from "../styles";

/* **************************************************
 * New Page (Server Component)
 **************************************************/
export default async function NewPagePage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <SWRPageProvider fallback={{}}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuova Pagina</h1>
          <Link href="/admin/pages" className={styles.backButton}>
            ← Indietro
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
