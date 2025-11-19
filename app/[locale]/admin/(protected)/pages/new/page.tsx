/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import PageFormClient from "../components/PageFormClient";
import SWRPageProvider from "@/components/providers/SWRPageProvider";
import styles from "../styles";

/* **************************************************
 * New Page (Server Component)
 **************************************************/
export default async function NewPagePage() {
  const user = await getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <SWRPageProvider fallback={{}}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nuova Pagina</h1>
        </div>
        <PageFormClient />
      </main>
    </SWRPageProvider>
  );
}

