/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useEffect } from "react";
import { GitMerge, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import styles from "./Sidebar/styles";

/* **************************************************
 * Merge Button Component
 **************************************************/
export default function MergeButton() {
  const [hasChanges, setHasChanges] = useState(false);
  const [aheadBy, setAheadBy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function handleMerge() {
    if (!hasChanges || isLoading) return;

    if (!confirm(`Sei sicuro di voler mergiare ${aheadBy} commit(s) da develop a main?`)) {
      return;
    }

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
        alert("Merge completato con successo!");
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        if (data.conflict) {
          setError("Conflitto di merge rilevato. Risolvi manualmente.");
        } else if (data.alreadyMerged) {
          setHasChanges(false);
          setAheadBy(0);
          setError(null);
        } else {
          setError(data.error || "Errore durante il merge");
        }
      }
    } catch (err) {
      console.error("Error merging:", err);
      setError("Errore durante il merge");
    } finally {
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
    <div className="mb-2">
      <button
        type="button"
        onClick={handleMerge}
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
          <GitMerge className={styles.navIcon} />
        )}
        <span>{isLoading ? "Mergiando..." : `Merge (${aheadBy})`}</span>
        {aheadBy > 0 && (
          <span className="absolute -top-1 -right-1 bg-tertiary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {aheadBy}
          </span>
        )}
      </button>
      {error && <div className="mt-1 text-xs text-red-500 px-4">{error}</div>}
    </div>
  );
}
