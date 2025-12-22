/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getPodcastBySlug } from "@/lib/github/podcasts";
import PodcastFormClient from "../../components/PodcastFormClient";
import styles from "../../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { ArrowLeft } from "lucide-react";

/* **************************************************
 * Types
 **************************************************/
type EditPodcastPageProps = {
  params: Promise<{ slug: string }>;
};

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
    redirect("/admin/podcasts");
  }

  // Pre-popolazione cache SWR
  const swrFallback = {
    [`/api/podcasts/${slug}`]: podcast,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Podcast</h1>
          <Link
            href="/admin/podcasts"
            className={styles.iconButton}
            aria-label="Indietro"
            title="Indietro"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <Suspense fallback={<div className={styles.loading}>Caricamento...</div>}>
          <PodcastFormClient podcastSlug={slug} />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
