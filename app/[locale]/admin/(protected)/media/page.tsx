/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect } from "next/navigation";

import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { getUser } from "@/lib/auth/server";
import { getAllMediaFiles } from "@/lib/github/media";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import MediaListClient from "./components/MediaListClient";
import MediaUploadClient from "./components/MediaUploadClient";
import styles from "./styles";

/* **************************************************
 * Media Page (Server Component)
 **************************************************/
export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const mediaFiles = await getAllMediaFiles();
  const adminDict = await getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN);

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/media": mediaFiles,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{adminDict.resourcePages.media.title}</h1>
          <Link href={withLocale("/admin", locale)} className={styles.backButton}>
            ← {adminDict.resourcePages.media.back}
          </Link>
        </div>

        <MediaUploadClient />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {adminDict.resourcePages.media.uploadedFiles}
          </h2>
          <MediaListClient />
        </div>
      </main>
    </SWRPageProvider>
  );
}
