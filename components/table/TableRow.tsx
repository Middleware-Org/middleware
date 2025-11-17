/* **************************************************
 * Imports
 **************************************************/
import { forwardRef } from "react";
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 **************************************************/
interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/* **************************************************
 * Table Row Component
 ************************************************** */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className, onClick, style }, ref) => {
    return (
      <tr
        ref={ref}
        style={style}
        className={cn(
          "hover:bg-gray-50 transition-colors",
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
      >
        {children}
      </tr>
    );
  },
);

TableRow.displayName = "TableRow";

