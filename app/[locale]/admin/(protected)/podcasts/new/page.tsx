/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";
import { cn } from "@/lib/utils/classes";

import PodcastFormClient from "../components/PodcastFormClient";
import PodcastFormSkeleton from "../components/PodcastFormSkeleton";
import styles from "../styles";

/* **************************************************
 * New Podcast Page (Server Component)
 **************************************************/
export default async function NewPodcastPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  return (
    <SWRPageProvider fallback={{}}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.podcasts.new}</h1>
          <Link href={withLocale("/admin/podcasts", locale)} className={styles.backButton}>
            ← {adminDict.resourcePages.podcasts.back}
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<PodcastFormSkeleton />}>
            <PodcastFormClient />
          </Suspense>
        </div>
      </div>
    </SWRPageProvider>
  );
}
