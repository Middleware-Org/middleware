"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Hash, Trash2, X } from "lucide-react";
import { Fragment } from "react";

import ConfirmDialog from "@/components/molecules/confirmDialog";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search";
import {
  ColumnSelector,
  ItemsPerPageSelector,
  SortableHeader,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  type ColumnConfig,
} from "@/components/table";
import { TableCheckbox } from "@/components/table/TableCheckbox";
import type { TableSort } from "@/hooks/useTableState";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../components/adminListCopy";
import baseStyles from "../styles";
import { entityCrudStyles } from "./entityCrudStyles";

/* **************************************************
 * Types
 **************************************************/
export type DeleteDialogConfig = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onClose: () => void;
};

type CrudListShellProps<T> = {
  // Loading
  isLoading: boolean;
  loadingText: string;
  isPending: boolean;

  // Data + render
  data: T[];
  emptyText: string;
  getItemKey: (item: T) => string;
  getItemLabel: (item: T) => string;
  renderCell: (item: T, columnKey: string) => React.ReactNode;

  // Column config
  columnConfig: ColumnConfig[];
  visibleColumns: string[];
  onColumnsChange: (cols: string[]) => void;

  // Sort
  sort: TableSort | null;
  onSort: (key: string) => void;

  // Items per page
  itemsPerPage: number;
  onItemsPerPageChange: (n: number) => void;

  // Pagination
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;

  // Search
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;

  // Count badge
  totalItems: number;
  countTitle: string;

  // Selection
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleSelectAll: () => void;
  isSelected: (id: string) => boolean;
  onToggleSelection: (id: string) => void;

  // Bulk actions
  selectedCount: number;
  selectedLabel: string;
  onDeleteMultiple: () => void;
  onClearSelection: () => void;

  // Dialogs
  deleteDialog: DeleteDialogConfig;
  deleteMultipleDialog: DeleteDialogConfig;
  cancelText: string;

  // Optional toolbar slots
  toolbarExtra?: React.ReactNode;
  toolbarBelow?: React.ReactNode;
};

/* **************************************************
 * CrudListShell
 **************************************************/
export default function CrudListShell<T>({
  isLoading,
  loadingText,
  isPending,
  data,
  emptyText,
  getItemKey,
  getItemLabel,
  renderCell,
  columnConfig,
  visibleColumns,
  onColumnsChange,
  sort,
  onSort,
  itemsPerPage,
  onItemsPerPageChange,
  totalPages,
  currentPage,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder,
  totalItems,
  countTitle,
  isAllSelected,
  isIndeterminate,
  onToggleSelectAll,
  isSelected,
  onToggleSelection,
  selectedCount,
  selectedLabel,
  onDeleteMultiple,
  onClearSelection,
  deleteDialog,
  deleteMultipleDialog,
  cancelText,
  toolbarExtra,
  toolbarBelow,
}: CrudListShellProps<T>) {
  const visibleColumnConfigs = columnConfig.filter((col) => visibleColumns.includes(col.key));

  if (isLoading && data.length === 0) {
    return (
      <div className={baseStyles.container}>
        <div className={baseStyles.loadingText}>{loadingText}</div>
      </div>
    );
  }

  return (
    <div className={baseStyles.container}>
      {/* Search and Filters */}
      <div className={baseStyles.searchContainer}>
        <div className={baseStyles.searchRow}>
          <div className={baseStyles.searchInputWrapper}>
            <SearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
          </div>
          {toolbarExtra}
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={onColumnsChange}
          />
          <ItemsPerPageSelector value={itemsPerPage} onChange={onItemsPerPageChange} />
          <div
            className="flex items-center h-[34px] gap-1.5 px-2 py-1 border border-secondary"
            title={countTitle}
          >
            <Hash className="h-4 w-4 text-secondary/60" />
            <span className="text-xs text-secondary/80">{totalItems}</span>
          </div>
        </div>
        {toolbarBelow}
      </div>

      {/* Table */}
      <div className={baseStyles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <th className={baseStyles.tableHeaderCell} style={{ width: "40px" }}>
                <TableCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleSelectAll}
                  ariaLabel={adminListCopy.common.selectAll}
                />
              </th>
              {visibleColumnConfigs.map((column) => {
                if (column.key === "actions") {
                  return (
                    <th key={column.key} className={baseStyles.tableHeaderCell}>
                      {column.label}
                    </th>
                  );
                }
                return (
                  <SortableHeader
                    key={column.key}
                    sortKey={column.key}
                    currentSort={sort || undefined}
                    onSort={onSort}
                  >
                    {column.label}
                  </SortableHeader>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnConfigs.length + 1}
                  className={baseStyles.tableEmptyCell}
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const key = getItemKey(item);
                return (
                  <TableRow key={key}>
                    <TableCell>
                      <TableCheckbox
                        checked={isSelected(key)}
                        onChange={() => onToggleSelection(key)}
                        disabled={isPending}
                        ariaLabel={`Seleziona ${getItemLabel(item)}`}
                      />
                    </TableCell>
                    {visibleColumnConfigs.map((column) => (
                      <Fragment key={column.key}>{renderCell(item, column.key)}</Fragment>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-tertiary/10 border border-tertiary rounded">
          <span className="text-sm text-secondary">
            {selectedCount} {selectedLabel}
          </span>
          <button
            onClick={onDeleteMultiple}
            disabled={isPending}
            className={cn(
              entityCrudStyles.iconButton,
              entityCrudStyles.iconButtonDanger,
              "ml-auto",
            )}
            aria-label={adminListCopy.common.deleteSelected}
            title={adminListCopy.common.deleteSelected}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearSelection}
            disabled={isPending}
            className={cn(entityCrudStyles.iconButton)}
            aria-label={adminListCopy.common.deselectAll}
            title={adminListCopy.common.deselectAll}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.isOpen && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={deleteDialog.onClose}
          onConfirm={deleteDialog.onConfirm}
          title={deleteDialog.title}
          message={deleteDialog.message}
          confirmText={deleteDialog.confirmText}
          cancelText={cancelText}
          confirmButtonClassName={entityCrudStyles.deleteButton}
          isLoading={isPending}
        />
      )}

      {/* Delete Multiple Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={deleteMultipleDialog.onClose}
        onConfirm={deleteMultipleDialog.onConfirm}
        title={deleteMultipleDialog.title}
        message={deleteMultipleDialog.message}
        confirmText={deleteMultipleDialog.confirmText}
        cancelText={cancelText}
        confirmButtonClassName={entityCrudStyles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
