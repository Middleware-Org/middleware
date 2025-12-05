/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useRef, useEffect } from "react";
import { Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
export interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible?: boolean;
}

interface ColumnSelectorProps {
  columns: ColumnConfig[];
  visibleColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  className?: string;
}

/* **************************************************
 * Column Selector Component
 **************************************************/
export function ColumnSelector({
  columns,
  visibleColumns,
  onColumnsChange,
  className,
}: ColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function toggleColumn(key: string) {
    if (visibleColumns.includes(key)) {
      // Non permettere di nascondere tutte le colonne
      if (visibleColumns.length > 1) {
        onColumnsChange(visibleColumns.filter((col) => col !== key));
      }
    } else {
      onColumnsChange([...visibleColumns, key]);
    }
  }

  function showAll() {
    onColumnsChange(columns.map((col) => col.key));
  }

  function hideAll() {
    // Mantieni almeno una colonna visibile
    if (visibleColumns.length > 1) {
      onColumnsChange([visibleColumns[0]]);
    }
  }

  return (
    <div className={cn("relative", className || "")} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Colonne visibili"
        className={cn(
          "flex items-center justify-center p-2 border border-secondary h-[34px]",
          "hover:bg-tertiary/10 focus:outline-none focus:ring-2 focus:ring-tertiary",
          "text-secondary transition-all duration-150",
        )}
      >
        <Settings2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-primary border border-secondary shadow-lg z-50">
          <div className="p-2 border-b border-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-secondary">Colonne visibili</span>
              <div className="flex gap-1">
                <button
                  onClick={showAll}
                  className="text-xs text-tertiary hover:text-tertiary/80 hover:underline transition-colors"
                >
                  Tutte
                </button>
                <span className="text-secondary/30">|</span>
                <button
                  onClick={hideAll}
                  className="text-xs text-secondary/60 hover:text-secondary hover:underline transition-colors"
                >
                  Nessuna
                </button>
              </div>
            </div>
            <div className="text-xs text-secondary/60">
              {visibleColumns.length} di {columns.length} colonne
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {columns.map((column) => {
              const isVisible = visibleColumns.includes(column.key);
              return (
                <label
                  key={column.key}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-tertiary/10 transition-colors",
                    !isVisible ? "opacity-50" : "",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleColumn(column.key)}
                    disabled={isVisible && visibleColumns.length === 1}
                    className="border-secondary text-tertiary focus:ring-tertiary"
                    aria-label={`Toggle ${column.label} column`}
                  />
                  <span className="text-sm text-secondary flex-1">{column.label}</span>
                  {isVisible && <Check className="h-4 w-4 text-tertiary" />}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
