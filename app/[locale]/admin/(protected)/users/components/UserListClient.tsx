"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

import { TableCell } from "@/components/table";
import { useUsers } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { ApiUser } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import { adminListCopy } from "../../components/adminListCopy";
import CrudListShell from "../../shared/CrudListShell";
import { entityCrudStyles } from "../../shared/entityCrudStyles";
import { useCrudList } from "../../shared/useCrudList";
import { deleteUserAction, deleteUsersAction } from "../actions";

/* **************************************************
 * Column Configuration
 **************************************************/
const columnConfig = [
  { key: "email", label: "Email", defaultVisible: true },
  { key: "name", label: "Nome", defaultVisible: true },
  { key: "role", label: "Ruolo", defaultVisible: true },
  { key: "createdAt", label: "Data Creazione", defaultVisible: true },
  { key: "actions", label: "Azioni", defaultVisible: true },
] as const;

/* **************************************************
 * User List Client Component
 **************************************************/
export default function UserListClient() {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const { users = [], isLoading } = useUsers();

  const {
    isPending,
    startTransition,
    deleteDialog,
    deleteMultipleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openDeleteMultipleDialog,
    closeDeleteMultipleDialog,
    visibleColumns,
    setVisibleColumns,
    tableData,
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
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount,
  } = useCrudList({
    data: users,
    columnConfig: [...columnConfig],
    searchKeys: ["email", "name"],
    getItemId: (user) => user.id,
  });

  async function handleDeleteConfirm() {
    if (!deleteDialog.item) return;
    const { id } = deleteDialog.item;
    closeDeleteDialog();
    startTransition(async () => {
      const result = await deleteUserAction(id);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteErrorTitle });
      } else {
        toast.success(result.message || copy.deleteSuccess);
        mutate("/api/users");
        clearSelection();
      }
    });
  }

  async function handleDeleteMultipleConfirm() {
    if (selectedIds.length === 0) return;
    closeDeleteMultipleDialog();
    startTransition(async () => {
      const result = await deleteUsersAction(selectedIds);
      if (!result.success) {
        toast.actionResult(result, { errorTitle: copy.deleteManyErrorTitle });
      } else {
        toast.success(result.message || copy.deleteManySuccess);
        mutate("/api/users");
        clearSelection();
      }
    });
  }

  function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  function renderCell(user: ApiUser, columnKey: string) {
    switch (columnKey) {
      case "email":
        return <TableCell className="font-medium">{user.email}</TableCell>;
      case "name":
        return <TableCell>{user.name || <span className="text-secondary/60">—</span>}</TableCell>;
      case "role":
        return <TableCell>{user.role === "ADMIN" ? "Admin" : "Editor"}</TableCell>;
      case "createdAt":
        return <TableCell className="text-secondary/80">{formatDate(user.createdAt)}</TableCell>;
      case "actions":
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(toLocale(`/admin/users/${user.id}/edit`))}
                className={entityCrudStyles.iconButton}
                disabled={isPending}
                aria-label={adminListCopy.common.edit}
                title={adminListCopy.common.edit}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteDialog(user)}
                className={cn(entityCrudStyles.iconButton, entityCrudStyles.iconButtonDanger)}
                disabled={isPending}
                aria-label={adminListCopy.common.delete}
                title={adminListCopy.common.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </TableCell>
        );
      default:
        return null;
    }
  }

  const copy = adminListCopy.users;

  return (
    <CrudListShell<ApiUser>
      isLoading={isLoading}
      loadingText={copy.loading}
      isPending={isPending}
      data={tableData}
      emptyText={copy.empty}
      getItemKey={(u) => u.id}
      getItemLabel={(u) => u.email}
      renderCell={renderCell}
      columnConfig={[...columnConfig]}
      visibleColumns={visibleColumns}
      onColumnsChange={setVisibleColumns}
      sort={sort}
      onSort={setSort}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={setItemsPerPage}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setPage}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={adminListCopy.common.searchUserPlaceholder}
      totalItems={totalItems}
      countTitle={`${totalItems} ${totalItems === 1 ? copy.singular : copy.plural}`}
      isAllSelected={isAllSelected}
      isIndeterminate={isIndeterminate}
      onToggleSelectAll={toggleSelectAll}
      isSelected={isSelected}
      onToggleSelection={toggleSelection}
      selectedCount={selectedCount}
      selectedLabel={selectedCount === 1 ? copy.selectedSingular : copy.selectedPlural}
      onDeleteMultiple={() => openDeleteMultipleDialog(selectedCount)}
      onClearSelection={clearSelection}
      deleteDialog={{
        isOpen: deleteDialog.isOpen,
        title: copy.deleteDialogTitle,
        message: copy.deleteDialogMessage(deleteDialog.item?.email ?? ""),
        confirmText: copy.deleteDialogConfirm,
        onConfirm: handleDeleteConfirm,
        onClose: closeDeleteDialog,
      }}
      deleteMultipleDialog={{
        isOpen: deleteMultipleDialog.isOpen,
        title: copy.deleteManyDialogTitle,
        message: copy.deleteManyDialogMessage(deleteMultipleDialog.count),
        confirmText: copy.deleteDialogConfirm,
        onConfirm: handleDeleteMultipleConfirm,
        onClose: closeDeleteMultipleDialog,
      }}
      cancelText={adminListCopy.common.cancel}
    />
  );
}
