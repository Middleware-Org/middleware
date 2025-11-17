/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 ************************************************** */
const styles = {
  main: cn("p-6 max-w-7xl mx-auto"),
  title: cn("mb-2 text-2xl font-bold"),
  welcome: cn("mb-6 text-sm text-gray-500"),
  grid: cn("grid grid-cols-1 md:grid-cols-2 gap-6"),
  section: cn("bg-white rounded-lg border p-4"),
  sectionTitle: cn("mb-4 text-lg font-semibold text-gray-800"),
  list: cn("space-y-3"),
  listItem: cn("p-3 border rounded-md hover:bg-gray-50 transition-colors"),
  itemHeader: cn("flex items-start justify-between gap-2 mb-2"),
  itemTitle: cn("font-medium text-gray-900 flex-1"),
  itemSlug: cn("text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded"),
  itemDescription: cn("text-sm text-gray-600 mb-2 line-clamp-2"),
  itemMeta: cn("flex items-center gap-2 mb-2"),
  itemDate: cn("text-xs text-gray-500"),
  badge: cn("text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium"),
  relations: cn("mt-2 pt-2 border-t space-y-1"),
  relation: cn("flex items-center gap-2 text-xs"),
  relationLabel: cn("font-medium text-gray-600"),
  relationValue: cn("text-gray-800"),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
