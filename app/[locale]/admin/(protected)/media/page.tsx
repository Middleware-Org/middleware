/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllMediaFiles } from "@/lib/github/media";
import MediaListClient from "./components/MediaListClient";
import MediaUploadClient from "./components/MediaUploadClient";
import styles from "./styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";

/* **************************************************
 * Media Page (Server Component)
 **************************************************/
export default async function MediaPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const mediaFiles = await getAllMediaFiles();

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    "/api/media": mediaFiles,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gestione Media</h1>
          <Link href="/admin" className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <MediaUploadClient />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">File Caricati</h2>
          <MediaListClient />
        </div>
      </main>
    </SWRPageProvider>
  );
}

