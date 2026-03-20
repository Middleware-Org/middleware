/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Quote, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { adminModalCopy } from "../../components/adminModalCopy";
import { useDialogFocusTrap } from "../../components/useDialogFocusTrap";
import baseStyles from "../../styles";

/* **************************************************
 * Types
 **************************************************/
interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (citationId: string | number | null, citationText: string) => void;
  currentCitationId?: string | number | null;
  currentCitationText?: string;
  nextCitationId: number;
}

/* **************************************************
 * Citation Modal Component
 **************************************************/
export default function CitationModal({
  isOpen,
  onClose,
  onInsert,
  currentCitationId,
  currentCitationText,
  nextCitationId,
}: CitationModalProps) {
  const [text, setText] = useState(currentCitationText || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const animationFrameId = requestAnimationFrame(() => {
        setText(currentCitationText || "");
        textareaRef.current?.focus();
      });

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isOpen, currentCitationText]);

  useDialogFocusTrap(isOpen, modalRef, onClose);

  function handleSubmit() {
    if (text.trim()) {
      const citationId = currentCitationId || nextCitationId;
      onInsert(citationId, text.trim());
      setText("");
      onClose();
    }
  }

  function handleEnterKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
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
        ref={modalRef}
        tabIndex={-1}
        className={baseStyles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="citation-modal-title"
      >
        <div className={baseStyles.modalHeader}>
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-secondary" />
            <h2 id="citation-modal-title" className={baseStyles.modalTitle}>
              {currentCitationId
                ? adminModalCopy.citationModal.titleEdit
                : adminModalCopy.citationModal.titleCreate}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={baseStyles.modalCloseButton}
            aria-label={adminModalCopy.citationModal.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={baseStyles.modalContent}>
          <div className="mb-4">
            <label
              htmlFor="citation-text"
              className="block mb-2 text-sm font-medium text-secondary"
            >
              {adminModalCopy.citationModal.label}
            </label>
            <textarea
              ref={textareaRef}
              id="citation-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(e);
                handleEnterKey(e);
              }}
              placeholder={adminModalCopy.citationModal.placeholder}
              className={baseStyles.textarea}
              rows={5}
              autoFocus
            />
            <p className="mt-2 text-xs text-secondary/60">{adminModalCopy.citationModal.hint}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className={baseStyles.cancelButton}>
              {adminModalCopy.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={baseStyles.submitButton}
            >
              {currentCitationId
                ? adminModalCopy.citationModal.update
                : adminModalCopy.citationModal.insert}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
