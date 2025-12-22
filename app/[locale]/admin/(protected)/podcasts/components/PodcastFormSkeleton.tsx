/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";
import baseStyles from "../../styles";

/* **************************************************
 * Podcast Form Skeleton Component
 **************************************************/
export default function PodcastFormSkeleton() {
  return (
    <div className={baseStyles.formContainer}>
      <div className={styles.editorContainer}>
        <div className={styles.editorWrapper}>
          <div className="flex-1 min-h-0 border border-secondary p-4 bg-primary">
            <div className="animate-pulse text-secondary/60">Caricamento form...</div>
          </div>
        </div>
        <div className={styles.metaPanel}>
          <div className={styles.metaCard}>
            <div className="animate-pulse text-secondary/60">Caricamento metadati...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

