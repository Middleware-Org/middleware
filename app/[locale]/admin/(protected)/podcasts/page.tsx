/* **************************************************
 * Imports
 **************************************************/
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllPodcasts } from "@/lib/github/podcasts";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import PodcastListClient from "./components/PodcastListClient";
import PodcastListSkeleton from "./components/PodcastListSkeleton";
import styles from "./styles";

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
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/podcasts": podcasts,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.podcasts.title}</h1>
          <div className="flex gap-2">
            <Link
              href={withLocale("/admin/podcasts/new", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.podcasts.new}
              title={adminDict.resourcePages.podcasts.new}
            >
              <Plus className="w-4 h-4" />
            </Link>
            <Link
              href={withLocale("/admin", locale)}
              className={styles.iconButton}
              aria-label={adminDict.resourcePages.podcasts.back}
              title={adminDict.resourcePages.podcasts.back}
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
