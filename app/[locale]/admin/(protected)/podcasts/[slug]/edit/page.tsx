/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getPodcastBySlug } from "@/lib/github/podcasts";
import { withLocale } from "@/lib/i18n/path";
import { cn } from "@/lib/utils/classes";

import PodcastEditSkeleton from "../../components/PodcastEditSkeleton";
import PodcastFormClient from "../../components/PodcastFormClient";
import styles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface EditPodcastPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Edit Podcast Page (Server Component)
 **************************************************/
export default async function EditPodcastPage({ params }: EditPodcastPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const podcast = await getPodcastBySlug(slug);

  if (!podcast) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/podcasts/${slug}`]: podcast,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Podcast: {podcast.title}</h1>
          <Link href={withLocale("/admin/podcasts", locale)} className={styles.backButton}>
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
