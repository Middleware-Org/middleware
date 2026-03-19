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
import type { AdminDictionary } from "@/lib/i18n/types";
import { toast } from "@/hooks/use-toast";

type MergeButtonProps = {
  dict: AdminDictionary["mergeButton"];
};

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
export default function MergeButton({ dict }: MergeButtonProps) {
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
  const error = checkError ? dict.checkError : publishError;

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
      } else {
        if (data.conflict) {
          setPublishError(dict.conflictError);
        } else if (data.alreadyMerged) {
          // Invalidate cache to refresh status
          mutate("/api/github/merge/check");
          setPublishError(null);
        } else {
          setPublishError(data.error || dict.publishError);
        }
        setIsLoading(false);
      }
    } catch (err) {
      setPublishError(dict.publishError);
      toast.error(dict.publishError, err instanceof Error ? err.message : undefined);
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
          <span>{dict.checking}</span>
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
          <span>{dict.noChanges}</span>
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
              ? dict.publishing
              : `${dict.publishChanges} ${aheadBy > 0 ? `(${aheadBy})` : ""}`}
          </span>
        </button>
        {error && <div className="mt-1 text-xs text-red-500 px-4">{error}</div>}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handlePublishConfirm}
        title={dict.confirmTitle}
        message={dict.confirmMessage.replace("{{count}}", String(aheadBy))}
        confirmText={dict.confirmButton}
        cancelText={dict.cancelButton}
        isLoading={isLoading}
      />

      {/* Success Dialog */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        onConfirm={() => setShowSuccessDialog(false)}
        title={dict.successTitle}
        message={dict.successMessage}
        confirmText={dict.successButton}
        cancelText=""
      />
    </>
  );
}
