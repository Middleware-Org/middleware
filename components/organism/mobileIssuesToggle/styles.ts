/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  button: cn(
    "w-full p-4 border border-secondary bg-primary",
    "hover:bg-secondary hover:text-primary",
    "transition-colors duration-150"
  ),
  buttonText: cn("text-sm uppercase tracking-wide"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;

