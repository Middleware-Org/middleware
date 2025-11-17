/* **************************************************
 * Imports
 **************************************************/
import { getUser } from "@/lib/auth";
import styles from "./styles";

/* **************************************************
 * Admin Protected Page
 ************************************************** */
export default async function AdminProtectedPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Dashboard admin</h1>
      <p className={styles.welcome}>
        Ciao {user.name ?? user.email}, benvenutə nell&apos;area riservata.
      </p>
      {/* qui il resto della tua UI admin */}
    </main>
  );
}
