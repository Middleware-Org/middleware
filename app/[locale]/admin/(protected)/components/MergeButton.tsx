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
  const [isLoading, setIsLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [checkError, setCheckError] = useState(false);
  const [data, setData] = useState<{
    hasChanges: boolean;
    aheadBy: number;
    status: string;
  } | null>(null);

  // Fetch merge status on component mount
  useEffect(() => {
    let cancelled = false;

    async function checkMergeStatus() {
      try {
        setIsChecking(true);
        setCheckError(false);
        const response = await fetch("/api/github/merge/check");
        if (!response.ok) throw new Error("Failed to check merge status");
        const result = await response.json();
        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setCheckError(true);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    checkMergeStatus();

    return () => {
      cancelled = true;
    };
  }, []);

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

      const result = await res.json();

      if (res.ok && result.success) {
        // Refresh merge status
        const statusResponse = await fetch("/api/github/merge/check");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setData(statusData);
        }
        setShowSuccessDialog(true);
      } else {
        if (result.conflict) {
          setPublishError("Conflitto di merge rilevato. Risolvi manualmente.");
        } else if (result.alreadyMerged) {
          // Refresh status
          const statusResponse = await fetch("/api/github/merge/check");
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setData(statusData);
          }
          setPublishError(null);
        } else {
          setPublishError(result.error || "Errore durante la pubblicazione");
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
          <span>
            {isLoading
              ? "Pubblicando..."
              : `Pubblica Modifiche ${aheadBy > 0 ? `(${aheadBy})` : ""}`}
          </span>
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
        onClose={() => setShowSuccessDialog(false)}
        onConfirm={() => setShowSuccessDialog(false)}
        title="Pubblicazione completata"
        message="Le modifiche sono state pubblicate con successo! La pipeline è stata avviata."
        confirmText="OK"
        cancelText=""
      />
    </>
  );
}
