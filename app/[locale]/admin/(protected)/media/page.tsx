/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAllMediaFiles } from "@/lib/github/media";
import MediaListClient from "./components/MediaListClient";
import MediaUploadClient from "./components/MediaUploadClient";
import styles from "./styles";

/* **************************************************
 * Media Page (Server Component)
 **************************************************/
export default async function MediaPage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const mediaFiles = await getAllMediaFiles();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Media</h1>
        <Link href="/admin" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <Suspense fallback={<div className={styles.loading}>Caricamento...</div>}>
        <MediaUploadClient />
      </Suspense>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Immagini Caricate</h2>
        <Suspense fallback={<div className={styles.loading}>Caricamento immagini...</div>}>
          <MediaListClient mediaFiles={mediaFiles} />
        </Suspense>
      </div>
    </main>
  );
}

