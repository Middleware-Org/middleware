/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  header: cn(
    "bg-primary sticky top-0 z-10 transition-transform delay-300 duration-300 ease-in-out w-full translate-y-0",
  ),
  headerTopSub: cn(
    "flex items-center h-[85px] justify-between lg:px-10 md:px-4 px-4 mx-auto max-w-[1472px] w-full",
  ),
  headerBottomSub: cn("border-b border-secondary border-t h-[30px] w-full"),
  headerBottomSubContent: cn(
    "w-full h-full lg:px-10 md:px-4 px-4 mx-auto max-w-[1472px] flex justify-between items-center",
  ),
};

export default styles;
