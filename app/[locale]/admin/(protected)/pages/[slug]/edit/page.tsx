/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getPageBySlug } from "@/lib/github/pages";
import PageFormClient from "../../components/PageFormClient";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
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

  // Pre-popolazione cache SWR con dati SSR
  const swrFallback = {
    [`/api/pages/${slug}`]: page,
  };

  return (
    <SWRPageProvider fallback={swrFallback}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Modifica Pagina: {page.slug}</h1>
        </div>
        <PageFormClient pageSlug={slug} />
      </main>
    </SWRPageProvider>
  );
}
