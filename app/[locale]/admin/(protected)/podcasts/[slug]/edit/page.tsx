/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getPodcastBySlug } from "@/lib/github/podcasts";
import { cn } from "@/lib/utils/classes";
import PodcastFormClient from "../../components/PodcastFormClient";
import PodcastEditSkeleton from "../../components/PodcastEditSkeleton";
import styles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface EditPodcastPageProps {
  params: Promise<{ slug: string }>;
}

/* **************************************************
 * Edit Podcast Page (Server Component)
 **************************************************/
export default async function EditPodcastPage({ params }: EditPodcastPageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);

  if (!podcast) {
    notFound();
  }

  return (
    <div className={cn("h-full flex flex-col", styles.main)}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modifica Podcast: {podcast.title}</h1>
        <Link href="/admin/podcasts" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<PodcastEditSkeleton />}>
          <PodcastFormClient podcast={podcast} />
        </Suspense>
      </div>
    </div>
  );
}

