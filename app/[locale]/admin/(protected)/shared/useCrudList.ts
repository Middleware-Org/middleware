"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState, useMemo, useEffect, useTransition } from "react";

import type { ColumnConfig } from "@/components/table";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useTableState, type UseTableStateOptions } from "@/hooks/useTableState";

import { useCrudDeleteDialogs } from "../components/useCrudDeleteDialogs";

/* **************************************************
 * useCrudList
 *
 * Bundles all shared state for CRUD list pages:
 * - delete dialogs
 * - visible columns
 * - table state (search, sort, pagination, filters)
 * - row selection
 * - transition (isPending)
 **************************************************/
export function useCrudList<T extends Record<string, unknown>>({
  data,
  columnConfig,
  searchKeys,
  getItemId,
  tableStateOptions = {},
}: {
  data: T[];
  columnConfig: ColumnConfig[];
  searchKeys: (keyof T)[];
  getItemId: (item: T) => string;
  tableStateOptions?: Omit<UseTableStateOptions<T>, "data" | "searchKeys">;
}) {
  const [isPending, startTransition] = useTransition();

  const dialogs = useCrudDeleteDialogs<T>();

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columnConfig.filter((col) => col.defaultVisible !== false).map((col) => col.key),
  );

  const visibleColumnConfigs = useMemo(
    () => columnConfig.filter((col) => visibleColumns.includes(col.key)),
    [columnConfig, visibleColumns],
  );

  const tableState = useTableState<T>({
    data,
    searchKeys,
    ...tableStateOptions,
  });

  const selection = useTableSelection<T>(tableState.data, getItemId);

  // Clear selection when search or page changes
  useEffect(() => {
    selection.clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableState.search, tableState.currentPage]);

  return {
    // Transition
    isPending,
    startTransition,

    // Delete dialogs
    ...dialogs,

    // Visible columns
    visibleColumns,
    setVisibleColumns,
    visibleColumnConfigs,

    // Table state
    tableData: tableState.data,
    totalItems: tableState.totalItems,
    totalPages: tableState.totalPages,
    currentPage: tableState.currentPage,
    itemsPerPage: tableState.itemsPerPage,
    search: tableState.search,
    sort: tableState.sort,
    filters: tableState.filters,
    setSearch: tableState.setSearch,
    setSort: tableState.setSort,
    setFilter: tableState.setFilter,
    setPage: tableState.setPage,
    setItemsPerPage: tableState.setItemsPerPage,

    // Selection
    ...selection,
  };
}
