/* **************************************************
 * Imports
 **************************************************/
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/table";

/* **************************************************
 * Article List Skeleton
 **************************************************/
export default function ArticleListSkeleton() {
  return (
    <main className="lg:px-10 md:px-4 px-4 py-6 max-w-[1472px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-64 bg-secondary/20 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-40 bg-secondary/20 animate-pulse" />
          <div className="h-10 w-24 bg-secondary/20 animate-pulse" />
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <div className="bg-primary p-4 border border-secondary mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-10 w-full bg-secondary/20 animate-pulse" />
          </div>
          {/* Filtri button (icon only) */}
          <div className="h-[34px] w-[34px] bg-secondary/20 animate-pulse" />
          {/* ColumnSelector (icon only) */}
          <div className="h-[34px] w-[34px] bg-secondary/20 animate-pulse" />
          {/* ItemsPerPageSelector (select only) */}
          <div className="h-[34px] w-14 bg-secondary/20 animate-pulse" />
          {/* Counter (icon + number) */}
          <div className="h-[34px] w-16 bg-secondary/20 animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-primary border border-secondary overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="px-4 py-3">
                <div className="h-4 w-20 bg-secondary/20 animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-16 bg-secondary/20 animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-16 bg-secondary/20 animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-20 bg-secondary/20 animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-16 bg-secondary/20 animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-20 bg-secondary/20 animate-pulse" />
              </th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-48 bg-secondary/20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 bg-secondary/20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-secondary/20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-secondary/20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-secondary/20 animate-pulse" />
                    <div className="h-8 w-20 bg-secondary/20 animate-pulse" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
