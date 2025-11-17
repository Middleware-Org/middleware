/* **************************************************
 * Imports
 **************************************************/
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/table";

/* **************************************************
 * Author List Skeleton
 **************************************************/
export default function AuthorListSkeleton() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="bg-white p-4 rounded-lg border mb-4">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="px-4 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-4 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
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

