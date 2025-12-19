/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import { useDebounce } from "@/hooks/useDebounce";
import baseStyles from "../../styles";
import styles from "../styles";

/* **************************************************
 * Types
 **************************************************/
export interface SelectSearchOption {
  value: string;
  label: string;
}

interface SelectSearchProps {
  id: string;
  label: string;
  value: string;
  options: SelectSearchOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

/* **************************************************
 * SelectSearch Component
 **************************************************/
export default function SelectSearch({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Seleziona un'opzione",
  required = false,
  disabled = false,
  emptyMessage = "Nessuna opzione disponibile",
}: SelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on debounced search query
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return options;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return options.filter(
      (opt) => opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query),
    );
  }, [options, debouncedSearchQuery]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  }

  function handleClear() {
    onChange("");
    setSearchQuery("");
  }

  function handleToggle() {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery("");
      }
    }
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && "*"}
      </label>
      <div className="relative flex items-center gap-2">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            styles.select,
            "flex items-center justify-between cursor-pointer flex-1",
            "text-left",
            !selectedOption ? "text-secondary/60" : undefined,
            disabled ? "opacity-50 cursor-not-allowed" : undefined,
          )}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-secondary transition-transform duration-150 shrink-0 ml-2",
              isOpen ? "transform rotate-180" : undefined,
            )}
          />
        </button>
        {/* Clear Button - Outside the main button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-secondary/10 transition-colors shrink-0"
            title="Rimuovi selezione"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" id={id} name={id} value={value} required={required} />

      {/* Modal */}
      {isOpen && (
        <div className={baseStyles.modalOverlay}>
          <div ref={modalRef} className={cn(baseStyles.modalContainer, "max-w-md max-h-[70vh]")}>
            {/* Header */}
            <div className={baseStyles.modalHeader}>
              <h3 className={baseStyles.modalTitle}>{label}</h3>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={baseStyles.modalCloseButton}
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-secondary">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca..."
                  className={cn(styles.input, "pl-10")}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className={baseStyles.emptyState}>
                  <p>{emptyMessage}</p>
                  {searchQuery && (
                    <p className={baseStyles.emptyStateText}>
                      Nessun risultato per &quot;{searchQuery}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "w-full text-left px-4 py-3 transition-all duration-150",
                          "hover:bg-tertiary/10 hover:border-tertiary",
                          isSelected
                            ? "bg-tertiary/20 border border-tertiary font-medium text-tertiary"
                            : "border border-transparent text-secondary",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
