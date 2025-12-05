/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useEffect, useRef } from "react";
import { Link as LinkIcon, X } from "lucide-react";
import baseStyles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
  currentUrl?: string;
}

/* **************************************************
 * Link Modal Component
 **************************************************/
export default function LinkModal({ isOpen, onClose, onInsert, currentUrl }: LinkModalProps) {
  const [url, setUrl] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setUrl(currentUrl || "");
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, currentUrl]);

  function handleSubmit() {
    if (url.trim()) {
      // Aggiungi https:// se non presente
      let finalUrl = url.trim();
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = `https://${finalUrl}`;
      }
      onInsert(finalUrl);
      setUrl("");
      onClose();
    }
  }

  function handleEnterKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className={baseStyles.modalOverlay} onClick={onClose}>
      <div
        className={baseStyles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <div className={baseStyles.modalHeader}>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-secondary" />
            <h2 className={baseStyles.modalTitle}>Inserisci Link</h2>
          </div>
          <button type="button" onClick={onClose} className={baseStyles.modalCloseButton}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={baseStyles.modalContent}>
          <div className="mb-4">
            <label htmlFor="link-url" className="block mb-2 text-sm font-medium text-secondary">
              URL
            </label>
            <input
              ref={inputRef}
              id="link-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(e);
                handleEnterKey(e);
              }}
              placeholder="https://example.com"
              className={baseStyles.input}
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className={baseStyles.cancelButton}>
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!url.trim()}
              className={baseStyles.submitButton}
            >
              Inserisci
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
