/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import styles from "../../../styles";

/* **************************************************
 * Not Found Page
 **************************************************/
export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Articolo non trovato</h1>
        <Link href="/admin/articles" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">L&apos;articolo che stai cercando non esiste.</p>
        <Link href="/admin/articles" className={styles.submitButton}>
          Torna alla lista articoli
        </Link>
      </div>
    </main>
  );
}

