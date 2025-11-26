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
    "md:fixed md:top-[165px] md:left-0 md:right-0 md:px-4 md:max-w-[1472px] md:mx-auto md:pt-2",
    "fixed top-[145px] left-0 right-0 px-4 pt-2",
    "max-h-[calc(100vh-145px)] md:max-h-[calc(100vh-165px)] lg:max-h-[calc(100vh-155px)] overflow-y-auto",
    "bg-primary z-40 pb-4",
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
