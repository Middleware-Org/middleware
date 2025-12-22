/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import PodcastFormClient from "../components/PodcastFormClient";
import styles from "../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { ArrowLeft } from "lucide-react";

/* **************************************************
 * New Podcast Page (Server Component)
 **************************************************/
export default async function NewPodcastPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuovo Podcast</h1>
          <Link
            href="/admin/podcasts"
            className={styles.iconButton}
            aria-label="Indietro"
            title="Indietro"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <Suspense fallback={<div className={styles.loading}>Caricamento...</div>}>
          <PodcastFormClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
