/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "./Sidebar/styles";
import useSWR from "swr";
import { createFetcher } from "@/hooks/swr/fetcher";
import { mutate } from "swr";

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<{
  hasChanges: boolean;
  aheadBy: number;
  status: string;
}>("merge-check");

/* **************************************************
 * Publish Button Component
 **************************************************/
export default function MergeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Use SWR to fetch merge status (automatically refetches when cache is invalidated via mutate)
  const {
    data,
    isLoading: isChecking,
    error: checkError,
  } = useSWR<{
    hasChanges: boolean;
    aheadBy: number;
    status: string;
  }>("/api/github/merge/check", fetcher, {
    refreshInterval: 0, // Don't auto-refresh, only on cache invalidation
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const hasChanges = data?.hasChanges || false;
  const aheadBy = data?.aheadBy || 0;
  const error = checkError ? "Error checking merge status" : publishError;

  function handlePublishClick() {
    if (!hasChanges || isLoading) return;
    setShowConfirmDialog(true);
  }

  async function handlePublishConfirm() {
    setShowConfirmDialog(false);
    setIsLoading(true);
    setPublishError(null);

    try {
      const res = await fetch("/api/github/merge", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Invalidate the merge check cache to refresh the status
        mutate("/api/github/merge/check");
        setShowSuccessDialog(true);
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        if (data.conflict) {
          setPublishError("Conflitto di merge rilevato. Risolvi manualmente.");
        } else if (data.alreadyMerged) {
          // Invalidate cache to refresh status
          mutate("/api/github/merge/check");
          setPublishError(null);
        } else {
          setPublishError(data.error || "Errore durante la pubblicazione");
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error publishing:", err);
      setPublishError("Errore durante la pubblicazione");
      setIsLoading(false);
    }
  }

  // Show button states (checking or no changes)
  if (isChecking) {
    return (
      <div className="mb-2">
        <button
          type="button"
          disabled
          className={cn(styles.mergeButton, "opacity-50 cursor-not-allowed")}
        >
          <Loader2 className={cn(styles.navIcon, "animate-spin")} />
          <span>Controllo...</span>
        </button>
      </div>
    );
  }

  if (!hasChanges) {
    return (
      <div className="mb-2">
        <button
          type="button"
          disabled
          className={cn(styles.mergeButton, "opacity-50 cursor-not-allowed")}
        >
          <Rocket className={styles.navIcon} />
          <span>Nessuna modifica</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <button
          type="button"
          onClick={handlePublishClick}
          disabled={isLoading}
          className={cn(
            styles.mergeButton,
            "relative",
            isLoading ? "opacity-50 cursor-not-allowed" : "",
          )}
        >
          {isLoading ? (
            <Loader2 className={cn(styles.navIcon, "animate-spin")} />
          ) : (
            <Rocket className={styles.navIcon} />
          )}
          <span>{isLoading ? "Pubblicando..." : `Pubblica Modifiche`}</span>
          {aheadBy > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {aheadBy}
            </span>
          )}
        </button>
        {error && <div className="mt-1 text-xs text-red-500 px-4">{error}</div>}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handlePublishConfirm}
        title="Pubblica modifiche"
        message={`Sei sicuro di voler pubblicare ${aheadBy} modifiche? Questa azione attiverà il processo di pubblicazione.`}
        confirmText="Pubblica"
        cancelText="Annulla"
        isLoading={isLoading}
      />

      {/* Success Dialog */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          window.location.reload();
        }}
        onConfirm={() => {
          setShowSuccessDialog(false);
          window.location.reload();
        }}
        title="Pubblicazione completata"
        message="Le modifiche sono state pubblicate con successo! La pipeline è stata avviata."
        confirmText="OK"
        cancelText=""
      />
    </>
  );
}
