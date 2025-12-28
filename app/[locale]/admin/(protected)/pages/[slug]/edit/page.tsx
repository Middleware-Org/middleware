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
import styles from "../../styles";

/* **************************************************
 * Edit Page (Server Component)
 **************************************************/
export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    redirect("/admin/pages");
  }

  return (
    <div className={cn("h-full flex flex-col", styles.main)}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modifica Pagina: {page.slug}</h1>
        <Link href="/admin/pages" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<PageEditSkeleton />}>
          <PageFormClient page={page} />
        </Suspense>
      </div>
    </div>
  );
}
