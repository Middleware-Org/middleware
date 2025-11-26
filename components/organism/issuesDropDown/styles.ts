/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("relative w-full md:w-auto lg:w-auto"),
  button: cn(
    "flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer",
  ),
  dropdown: cn(
    "absolute top-full left-0 mt-1 bg-primary border border-b border-secondary shadow-lg z-50 min-w-[300px] flex flex-col gap-1 p-2",
  ),
  issueText: cn("text-xs md:text-base flex"),
  chevron: cn("w-2 h-2"),
  buttonIssue: cn("cursor-pointer w-full text-left p-0!"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
