/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getPodcastBySlug } from "@/lib/github/podcasts";
import { getAllIssues } from "@/lib/github/issues";
import { cn } from "@/lib/utils/classes";
import PodcastFormClient from "../../components/PodcastFormClient";
import PodcastEditSkeleton from "../../components/PodcastEditSkeleton";
import styles from "../../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

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
  const [podcast, issues] = await Promise.all([
    getPodcastBySlug(slug),
    getAllIssues(),
  ]);

  if (!podcast) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/podcasts/${slug}`]: podcast,
    "/api/issues": issues,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Podcast: {podcast.title}</h1>
          <Link href="/admin/podcasts" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<PodcastEditSkeleton />}>
            <PodcastFormClient podcastSlug={slug} />
          </Suspense>
        </div>
      </div>
    </SWRPageProvider>
  );
}

