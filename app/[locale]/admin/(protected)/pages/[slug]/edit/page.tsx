/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getPageBySlug } from "@/lib/github/pages";
import { cn } from "@/lib/utils/classes";
import PageFormClient from "../../components/PageFormClient";
import PageEditSkeleton from "../../components/PageEditSkeleton";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import styles from "../../styles";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * Edit Page (Server Component)
 **************************************************/
export default async function EditPagePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const page = await getPageBySlug(slug);

  if (!page) {
    redirect(withLocale("/admin/pages", locale));
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/pages/${slug}`]: page,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <div className={cn("h-full flex flex-col", styles.main)}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Pagina: {page.slug}</h1>
          <Link href={withLocale("/admin/pages", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<PageEditSkeleton />}>
            <PageFormClient pageSlug={slug} />
          </Suspense>
        </div>
      </div>
    </SWRPageProvider>
  );
}
