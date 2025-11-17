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
        className={cn(
          "flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary",
          "text-sm font-medium text-gray-700",
        )}
      >
        <Settings2 className="h-4 w-4" />
        Colonne
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Colonne visibili</span>
              <div className="flex gap-1">
                <button onClick={showAll} className="text-xs text-primary hover:underline">
                  Tutte
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={hideAll} className="text-xs text-gray-600 hover:underline">
                  Nessuna
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
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
                    "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50",
                    !isVisible ? "opacity-50" : "",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleColumn(column.key)}
                    disabled={isVisible && visibleColumns.length === 1}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    aria-label={`Toggle ${column.label} column`}
                  />
                  <span className="text-sm text-gray-700 flex-1">{column.label}</span>
                  {isVisible && <Check className="h-4 w-4 text-primary" />}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
