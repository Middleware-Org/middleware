/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn(
    "categories-list space-y-2 lg:block",
    "lg:sticky lg:top-[155px]",
    "max-h-[calc(100vh-155px)] overflow-y-auto",
    "bg-primary pb-4",
  ),
  containerOpen: cn("block"),
  containerClosed: cn("hidden"),
  item: cn(""),
  button: cn("text-left w-full"),
  buttonText: cn("text-sm"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
