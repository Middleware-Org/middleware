/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useTransition } from "react";
import { deleteMediaAction } from "../actions";
import { getGitHubImageUrl } from "@/lib/github/images";
import { useRouter } from "next/navigation";
import styles from "../styles";
import baseStyles from "../../styles";
import type { MediaFile } from "@/lib/github/media";
import Image from "next/image";

/* **************************************************
 * Types
 **************************************************/
interface MediaListClientProps {
  mediaFiles: MediaFile[];
}

/* **************************************************
 * Media List Client Component
 **************************************************/
export default function MediaListClient({ mediaFiles }: MediaListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  async function handleDelete(filename: string) {
    if (!confirm(`Sei sicuro di voler eliminare l'immagine "${filename}"?`)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteMediaAction(filename);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className={baseStyles.container}>
      {error && (
        <div className={error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}>
          ⚠️ {error.message}
        </div>
      )}

      {mediaFiles.length === 0 ? (
        <div className={styles.empty}>
          <p>Nessuna immagine trovata.</p>
          <p className={baseStyles.emptyStateText}>Carica la tua prima immagine usando il form sopra.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {mediaFiles.map((file) => (
            <div key={file.name} className={styles.imageCard}>
              <Image
                width={400}
                height={300}
                src={getGitHubImageUrl(file.url)}
                alt={file.name}
                className={styles.imageCardImg}
                unoptimized
              />
              <div className={styles.imageCardName}>{file.name}</div>
              <div className={styles.imageCardOverlay}>
                <button
                  onClick={() => handleDelete(file.name)}
                  className={styles.deleteButton}
                  disabled={isPending}
                  title={`Elimina ${file.name}`}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
