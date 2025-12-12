/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface TableCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/* **************************************************
 * Table Checkbox Component
 **************************************************/
export function TableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  ariaLabel,
  className,
}: TableCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(input) => {
        if (input) {
          input.indeterminate = indeterminate;
        }
      }}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "w-4 h-4 cursor-pointer",
        "border border-secondary bg-primary",
        "text-tertiary",
        "hover:border-tertiary hover:bg-tertiary/10",
        "focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-1",
        "transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "disabled:hover:border-secondary disabled:hover:bg-primary",
        "checked:bg-tertiary checked:border-tertiary",
        className,
      )}
    />
  );
}
