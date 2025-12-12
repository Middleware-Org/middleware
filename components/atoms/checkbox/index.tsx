/* **************************************************
 * Imports
 **************************************************/
import { forwardRef } from "react";
import { cn } from "@/lib/utils/classes";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

/* **************************************************
 * Checkbox Component
 **************************************************/
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, label, error, wrapperClassName, ...props }, ref) => {
    const inputElement = (
      <input
        type="checkbox"
        ref={(input) => {
          if (input && typeof ref === "function") {
            ref(input);
          } else if (input && typeof ref === "object" && ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = input;
          }
          if (input) {
            input.indeterminate = indeterminate || false;
          }
        }}
        className={cn(styles.checkbox, error && styles.checkboxError, className)}
        {...props}
      />
    );

    if (label || error) {
      return (
        <div className={cn(styles.container, wrapperClassName)}>
          <label className={styles.label}>
            {inputElement}
            {label && <span className={styles.labelText}>{label}</span>}
          </label>
          {error && <span className={styles.error}>{error}</span>}
        </div>
      );
    }

    return inputElement;
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
