/* **************************************************
 * Imports
 **************************************************/
import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getAuthorBySlug } from "@/lib/github/authors";
import AuthorFormClient from "../../components/AuthorFormClient";
import AuthorEditSkeleton from "../../components/AuthorEditSkeleton";
import styles from "../../styles";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * Types
 **************************************************/
interface EditAuthorPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* **************************************************
 * Edit Author Page (Server Component)
 **************************************************/
export default async function EditAuthorPage({ params }: EditAuthorPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/authors/${slug}`]: author,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Autore: {author.name}</h1>
          <Link href={withLocale("/admin/authors", locale)} className={styles.backButton}>
            ← Indietro
          </Link>
        </div>

        <Suspense fallback={<AuthorEditSkeleton />}>
          <AuthorFormClient authorSlug={slug} />
        </Suspense>
      </main>
    </SWRPageProvider>
  );
}
