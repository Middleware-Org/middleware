/* **************************************************
 * Imports
 **************************************************/
"use client";

import { cn } from "@/lib/utils/classes";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* **************************************************
 * Types
 **************************************************/
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/* **************************************************
 * Pagination Component
 **************************************************/
export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 px-4 py-3 border-t border-secondary relative",
        className,
      )}
    >
      {/* Pagination Buttons - Centered */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "px-3 py-2 border border-secondary rounded-md text-sm text-secondary",
            "hover:bg-tertiary hover:text-white hover:border-tertiary",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-secondary disabled:hover:border-secondary",
            "focus:outline-none focus:ring-2 focus:ring-tertiary",
            "transition-all duration-150",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={cn(
                "px-3 py-2 border border-secondary rounded-md text-sm text-secondary",
                "hover:bg-tertiary hover:text-white hover:border-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-tertiary",
                "transition-all duration-150",
              )}
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-secondary/60">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-2 border rounded-md text-sm font-medium",
              "focus:outline-none focus:ring-2 focus:ring-tertiary",
              "transition-all duration-150",
              page === currentPage
                ? "bg-tertiary text-white border-tertiary"
                : "border-secondary text-secondary hover:bg-tertiary hover:text-white hover:border-tertiary",
            )}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-secondary/60">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={cn(
                "px-3 py-2 border border-secondary rounded-md text-sm text-secondary",
                "hover:bg-tertiary hover:text-white hover:border-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-tertiary",
                "transition-all duration-150",
              )}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "px-3 py-2 border border-secondary rounded-md text-sm text-secondary",
            "hover:bg-tertiary hover:text-white hover:border-tertiary",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-secondary disabled:hover:border-secondary",
            "focus:outline-none focus:ring-2 focus:ring-tertiary",
            "transition-all duration-150",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Page Info - Below buttons */}
      <div className="text-sm text-secondary/80 absolute right-4 top-1/2 -translate-y-1/2">
        Pagina {currentPage} di {totalPages}
      </div>
    </div>
  );
}
