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
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "px-3 py-2 border border-gray-300 rounded-md text-sm",
            "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-primary",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={cn(
                "px-3 py-2 border border-gray-300 rounded-md text-sm",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-2 border rounded-md text-sm",
              page === currentPage
                ? "bg-primary text-white border-primary"
                : "border-gray-300 hover:bg-gray-50",
              "focus:outline-none focus:ring-2 focus:ring-primary",
            )}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={cn(
                "px-3 py-2 border border-gray-300 rounded-md text-sm",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary",
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
            "px-3 py-2 border border-gray-300 rounded-md text-sm",
            "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-primary",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Pagina {currentPage} di {totalPages}
      </div>
    </div>
  );
}
