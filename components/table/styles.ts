/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  table: cn("w-full border-collapse"),
  tableWrapper: cn("overflow-x-auto"),
  header: cn("bg-primary border-b border-secondary"),
  headerCell: cn(
    "px-4 py-3 text-left text-xs font-medium text-secondary/60 uppercase tracking-wider",
  ),
  sortableHeader: cn(
    "px-4 py-3 text-left text-xs font-medium text-secondary/60 uppercase tracking-wider",
    "cursor-pointer select-none hover:bg-tertiary/10 transition-colors duration-150",
  ),
  row: cn("hover:bg-tertiary/10 transition-colors duration-150"),
  rowClickable: cn("cursor-pointer"),
  cell: cn("px-4 py-3"),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
