/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, useEffect, Fragment } from "react";
import { Hash, Pencil, Trash2, X } from "lucide-react";
import { deleteIssueAction, deleteIssuesAction } from "../actions";
import { useTableState } from "@/hooks/useTableState";
import { useTableSelection } from "@/hooks/useTableSelection";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  SortableHeader,
  ColumnSelector,
  type ColumnConfig,
  ItemsPerPageSelector,
} from "@/components/table";
import { TableCheckbox } from "@/components/table/TableCheckbox";
import { SearchInput } from "@/components/search";
import { Pagination } from "@/components/pagination";
import ConfirmDialog from "@/components/molecules/confirmDialog";
import { cn } from "@/lib/utils/classes";
import styles from "../styles";
import baseStyles from "../../styles";
import type { Issue } from "@/lib/github/types";
import Image from "next/image";


import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig: ColumnConfig[] = [
  { key: "cover", label: "Cover", defaultVisible: true },
  { key: "title", label: "Titolo", defaultVisible: true },
  { key: "slug", label: "Slug", defaultVisible: true },
  { key: "date", label: "Data", defaultVisible: true },
  { key: "color", label: "Colore", defaultVisible: false },
  { key: "description", label: "Descrizione", defaultVisible: false },
  { key: "actions", label: "Azioni", defaultVisible: true },
];

/* **************************************************
 * Issue List Client Component
 **************************************************/
export default function IssueListClient({ initialIssues }: IssueListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ message: string; type: "error" | "warning" } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState<{
    isOpen: boolean;
    count: number;
  }>({
    isOpen: false,
    count: 0,
  });

  // Use data from props
  const issues = initialIssues;


  // Initialize visible columns from defaultVisible
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columnConfig.filter((col) => col.defaultVisible !== false).map((col) => col.key),
  );

  const {
    data: tableData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    search,
    sort,
    setSearch,
    setSort,
    setPage,
    setItemsPerPage,
  } = useTableState<Issue>({
    data: issues,
    searchKeys: ["title", "slug", "description"],
    itemsPerPage: 10,
  });

  // Multi-selection
  const {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useTableSelection(tableData, (issue) => issue.slug);

  // Get visible column configs
  const visibleColumnConfigs = useMemo(() => {
    return columnConfig.filter((col) => visibleColumns.includes(col.key));
  }, [visibleColumns]);






  // Clear selection when search or page changes

    clearSelection();
  }, [search, currentPage, clearSelection]);

  function handleEdit(issue: Issue) {
    router.push(`/admin/issues/${issue.slug}/edit`);


  function handleDeleteClick(issue: Issue) {
    setDeleteDialog({ isOpen: true, issue });


  async function handleDeleteConfirm() {
    if (!deleteDialog.issue) return;

    const { slug } = deleteDialog.issue;
    setError(null);
    setDeleteDialog({ isOpen: false, issue: null });

    startTransition(async () => {
      const result = await deleteIssueAction(slug);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Refresh the page to get updated data
        router.refresh();

        clearSelection();
    
    });


  function handleDeleteMultipleClick() {
    if (selectedCount === 0) return;
    setDeleteMultipleDialog({ isOpen: true, count: selectedCount });


  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;

    setError(null);
    setDeleteMultipleDialog({ isOpen: false, count: 0 });

    startTransition(async () => {
      const result = await deleteIssuesAction(selectedIds);

      if (!result.success) {
        setError({
          message: result.error,
          type: result.errorType || "error",
        });
      } else {
        // Refresh the page to get updated data
        router.refresh();

        clearSelection();
    
    });


  function renderCell(issue: Issue, columnKey: string) {
    switch (columnKey) {
      case "cover":
    
          <TableCell>
            {issue.cover ? (
              <Image
                src={getGitHubImageUrl(issue.cover)}
                width={64}
                height={64}
                alt={issue.title}
                className="w-16 h-16 object-cover border border-secondary"
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 bg-secondary/20 border border-secondary flex items-center justify-center text-xs text-secondary/60">
                No image
        
            )}
          </TableCell>
    
      case "title":
        return <TableCell className="font-medium">{issue.title}</TableCell>;
      case "slug":
    
          <TableCell>
            <span className="text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1">
              {issue.slug}
            </span>
          </TableCell>
    
      case "date":
        return <TableCell>{new Date(issue.date).toLocaleDateString("it-IT")}</TableCell>;
      case "color":
    
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <div
                className="w-6 h-6 border border-secondary"
                style={{ backgroundColor: issue.color }}
              />
              <span className="text-xs text-secondary/80 font-mono">{issue.color}</span>
      
          </TableCell>
    
      case "description":
    
          <TableCell className="text-secondary/80 max-w-md truncate">{issue.description}</TableCell>
    
      case "actions":
    
          <TableCell>
            <div className={baseStyles.buttonGroup}>
              <button
                onClick={() => handleEdit(issue)}
                className={styles.iconButton}
                disabled={isPending}
                aria-label="Modifica"
                title="Modifica"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(issue)}
                className={cn(styles.iconButton, styles.iconButtonDanger)}
                disabled={isPending}
                aria-label="Elimina"
                title="Elimina"
              >
                <Trash2 className="w-4 h-4" />
              </button>
      
          </TableCell>
    
      default:
        return null;
  











  return (
    <div className={baseStyles.container}>
      {error && (
        <div className={error.type === "warning" ? baseStyles.errorWarning : baseStyles.error}>
          ⚠️ {error.message}
  
      )}

      {/* Search and Filters */}
      <div className={baseStyles.searchContainer}>
        <div className={baseStyles.searchRow}>
          <div className={baseStyles.searchInputWrapper}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cerca per titolo, slug o descrizione..."
            />
    
          <ColumnSelector
            columns={columnConfig}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
          <ItemsPerPageSelector value={itemsPerPage} onChange={setItemsPerPage} />
          <div
            className="flex items-center h-[34px] gap-1.5 px-2 py-1 border border-secondary"
            title={`${totalItems} ${totalItems === 1 ? "issue" : "issues"}`}
          >
            <Hash className="h-4 w-4 text-secondary/60" />
            <span className="text-xs text-secondary/80">{totalItems}</span>
    
  


      {/* Table */}
      <div className={baseStyles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <th className={baseStyles.tableHeaderCell} style={{ width: "40px" }}>
                <TableCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={toggleSelectAll}
                  ariaLabel="Seleziona tutti"
                />
              </th>
              {visibleColumnConfigs.map((column) => {
                if (column.key === "actions") {
              
                    <th key={column.key} className={baseStyles.tableHeaderCell}>
                      {column.label}
                    </th>
              
              
            
                  <SortableHeader
                    key={column.key}
                    sortKey={column.key}
                    currentSort={sort || undefined}
                    onSort={setSort}
                  >
                    {column.label}
                  </SortableHeader>
            
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnConfigs.length + 1}
                  className={baseStyles.tableEmptyCell}
                >
                  Nessuna issue trovata
                </TableCell>
              </TableRow>
            ) : (
              tableData.map((issue) => (
                <TableRow key={issue.slug}>
                  <TableCell>
                    <TableCheckbox
                      checked={isSelected(issue.slug)}
                      onChange={() => toggleSelection(issue.slug)}
                      disabled={isPending}
                      ariaLabel={`Seleziona ${issue.title}`}
                    />
                  </TableCell>
                  {visibleColumnConfigs.map((column) => (
                    <Fragment key={column.key}>{renderCell(issue, column.key)}</Fragment>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}


      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-tertiary/10 border border-tertiary rounded">
          <span className="text-sm text-secondary">
            {selectedCount} {selectedCount === 1 ? "issue selezionata" : "issue selezionate"}
          </span>
          <button
            onClick={handleDeleteMultipleClick}
            disabled={isPending}
            className={cn(styles.iconButton, styles.iconButtonDanger, "ml-auto")}
            aria-label="Elimina selezionate"
            title="Elimina selezionate"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={clearSelection}
            disabled={isPending}
            className={cn(styles.iconButton)}
            aria-label="Deseleziona tutto"
            title="Deseleziona tutto"
          >
            <X className="w-4 h-4" />
          </button>
  
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.issue && (
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, issue: null })}
          onConfirm={handleDeleteConfirm}
          title="Elimina Issue"
          message={`Sei sicuro di voler eliminare l'issue "${deleteDialog.issue.title}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          confirmButtonClassName={styles.deleteButton}
          isLoading={isPending}
        />
      )}

      {/* Delete Multiple Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteMultipleDialog.isOpen}
        onClose={() => setDeleteMultipleDialog({ isOpen: false, count: 0 })}
        onConfirm={handleDeleteMultipleConfirm}
        title="Elimina Issue"
        message={`Sei sicuro di voler eliminare ${deleteMultipleDialog.count} issue? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        confirmButtonClassName={styles.deleteButton}
        isLoading={isPending}
      />
    </div>
  );
}
