/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useEffect } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import styles from "./Sidebar/styles";

/* **************************************************
 * Publish Button Component
 **************************************************/
export default function MergeButton() {
  const [hasChanges, setHasChanges] = useState(false);
  const [aheadBy, setAheadBy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Check for changes to merge
  useEffect(() => {
    async function checkMergeStatus() {
      try {
        setIsChecking(true);
        const res = await fetch("/api/github/merge/check");
        if (res.ok) {
          const data = await res.json();
          setHasChanges(data.hasChanges);
          setAheadBy(data.aheadBy || 0);
          setError(null);
        } else {
          setError("Failed to check merge status");
        }
      } catch (err) {
        console.error("Error checking merge status:", err);
        setError("Error checking merge status");
      } finally {
        setIsChecking(false);
      }
    }

    checkMergeStatus();
    // Check every 30 seconds
    const interval = setInterval(checkMergeStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  function handlePublishClick() {
    if (!hasChanges || isLoading) return;
    setShowConfirmDialog(true);
  }

  async function handlePublishConfirm() {
    setShowConfirmDialog(false);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/github/merge", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setHasChanges(false);
        setAheadBy(0);
        setShowSuccessDialog(true);
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        if (data.conflict) {
          setError("Conflitto di merge rilevato. Risolvi manualmente.");
        } else if (data.alreadyMerged) {
          setHasChanges(false);
          setAheadBy(0);
          setError(null);
        } else {
          setError(data.error || "Errore durante la pubblicazione");
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error publishing:", err);
      setError("Errore durante la pubblicazione");
      setIsLoading(false);
    }
  }

  // Don't show button if checking or if no changes
  if (isChecking) {
    return (
      <button
        type="button"
        disabled
        className={cn(styles.mergeButton, "opacity-50 cursor-not-allowed")}
      >
        <Loader2 className={cn(styles.navIcon, "animate-spin")} />
        <span>Controllo...</span>
      </button>
    );
  }

  if (!hasChanges) {
    return null; // Don't show button if no changes
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
          <span>{isLoading ? "Pubblicando..." : `Pubblica (${aheadBy})`}</span>
          {aheadBy > 0 && (
            <span className="absolute -top-1 -right-1 bg-tertiary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
