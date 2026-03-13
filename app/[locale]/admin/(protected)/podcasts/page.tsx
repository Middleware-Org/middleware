/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllPodcasts } from "@/lib/github/podcasts";
import PodcastListClient from "./components/PodcastListClient";
import PodcastListSkeleton from "./components/PodcastListSkeleton";
import styles from "./styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";
import { Plus, ArrowLeft } from "lucide-react";

/* **************************************************
 * Podcasts List Page (Server Component)
 **************************************************/
export default async function PodcastsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const podcasts = await getAllPodcasts();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/podcasts": podcasts,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Podcasts</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/podcasts/new", locale)}
              className={styles.iconButton}
              aria-label="Nuovo Podcast"
              title="Nuovo Podcast"
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

        <Suspense fallback={<PodcastListSkeleton />}>
          <PodcastListClient />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
