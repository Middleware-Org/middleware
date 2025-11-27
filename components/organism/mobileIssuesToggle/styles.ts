/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  wrapper: cn("flex flex-col w-full"),
  buttonTextOpen: cn("text-sm"),
  buttonTextClosed: cn("text-white text-sm"),
  list: cn("mt-6 space-y-2 max-h-[calc(100vh-189px)] overflow-y-auto bg-primary pb-4"),
  item: cn(""),
  link: cn("text-left w-full block"),
  linkText: cn("text-sm"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
