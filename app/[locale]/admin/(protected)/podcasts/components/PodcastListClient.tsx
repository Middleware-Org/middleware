/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deletePodcastAction } from "../actions";
import { cn } from "@/lib/utils/classes";
import styles from "../styles";
import type { Podcast } from "@/lib/github/types";
import useSWR, { mutate } from "swr";
import ConfirmDialog from "@/components/molecules/confirmDialog";

/* **************************************************
 * Podcast List Client Component
 **************************************************/
export default function PodcastListClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; podcast: Podcast | null }>({
    isOpen: false,
    podcast: null,
  });

  // Usa SWR per ottenere i podcast
  const {
    data: podcasts = [],
    isLoading,
    error: swrError,
  } = useSWR<Podcast[]>("/api/podcasts", async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch podcasts");
    return res.json();
  });

  const handleDelete = async () => {
    if (!deleteDialog.podcast) return;

    startTransition(async () => {
      const result = await deletePodcastAction(deleteDialog.podcast!.slug);

      if (!result.success) {
        setError(result.error);
      } else {
        setError(null);
        // Revalida cache SWR
        await mutate("/api/podcasts");
        router.refresh();
      }

      setDeleteDialog({ isOpen: false, podcast: null });
    });
  };

  if (isLoading) {
    return <div className={styles.loading}>Caricamento...</div>;
  }

  if (swrError) {
    return <div className={styles.error}>Errore nel caricamento dei podcast</div>;
  }

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-secondary">
              <th className="text-left p-3 font-semibold">Titolo</th>
              <th className="text-left p-3 font-semibold">Slug</th>
              <th className="text-left p-3 font-semibold">Data</th>
              <th className="text-left p-3 font-semibold">Stato</th>
              <th className="text-right p-3 font-semibold">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {podcasts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-secondary">
                  Nessun podcast trovato.{" "}
                  <Link href="/admin/podcasts/new" className="text-tertiary hover:underline">
                    Creane uno nuovo
                  </Link>
                </td>
              </tr>
            ) : (
              podcasts.map((podcast) => (
                <tr key={podcast.slug} className="border-b border-secondary hover:bg-secondary/5">
                  <td className="p-3">{podcast.title}</td>
                  <td className="p-3 text-secondary text-sm">{podcast.slug}</td>
                  <td className="p-3 text-secondary text-sm">
                    {new Date(podcast.date).toLocaleDateString("it-IT")}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded",
                        podcast.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800",
                      )}
                    >
                      {podcast.published ? "Pubblicato" : "Bozza"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/podcasts/${podcast.slug}/edit`}
                        className={styles.editButton}
                        title="Modifica"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, podcast })}
                        className={styles.deleteButton}
                        title="Elimina"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, podcast: null })}
        onConfirm={handleDelete}
        title="Elimina Podcast"
        message={`Sei sicuro di voler eliminare il podcast "${deleteDialog.podcast?.title}"?`}
        confirmText="Elimina"
        cancelText="Annulla"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
