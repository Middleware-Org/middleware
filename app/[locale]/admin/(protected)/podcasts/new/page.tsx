/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { cn } from "@/lib/utils/classes";
import PodcastFormClient from "../components/PodcastFormClient";
import PodcastFormSkeleton from "../components/PodcastFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Podcast Page (Server Component)
 **************************************************/
export default async function NewPodcastPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuovo Podcast</h1>
          <Link href="/admin/podcasts" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<PodcastFormSkeleton />}>
            <PodcastFormClient />
          </Suspense>
        </div>
      </div>
  );
}

