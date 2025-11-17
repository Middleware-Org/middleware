/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState, useMemo } from "react";
import type { SortDirection } from "@/components/table/SortableHeader";

/* **************************************************
 * Types
 **************************************************/
export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableFilters {
  [key: string]: string | number | boolean | null;
}

export interface UseTableStateOptions<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  itemsPerPage?: number;
  initialSort?: TableSort;
  initialFilters?: TableFilters;
}

/* **************************************************
 * Hook for Table State Management
 **************************************************/
export function useTableState<T extends Record<string, unknown>>({
  data,
  searchKeys = [],
  itemsPerPage = 10,
  initialSort,
  initialFilters = {},
}: UseTableStateOptions<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<TableSort | null>(initialSort || null);
  const [filters, setFilters] = useState<TableFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(searchLower);
        }),
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== "" && value !== undefined) {
        result = result.filter((item) => {
          const itemValue = item[key];
          if (typeof value === "string") {
            return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
          }
          return itemValue === value;
        });
      }
    });

    return result;
  }, [data, search, filters, searchKeys]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sort || !sort.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset page when filters/search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | number | boolean | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        // Cycle: asc -> desc -> null
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    // Data
    data: paginatedData,
    totalItems: sortedData.length,
    totalPages,
    currentPage,

    // State
    search,
    sort,
    filters,

    // Actions
    setSearch: handleSearchChange,
    setSort: handleSort,
    setFilter: handleFilterChange,
    setPage: handlePageChange,

    // Helpers
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

