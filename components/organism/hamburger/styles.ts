/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  hamburger: cn("flex flex-col justify-between items-end h-5 cursor-pointer"),
  hamburgerLine: cn(
    "bg-secondary block transition-all duration-300 ease-out h-0.5 w-[37px] rounded-sm",
  ),
  hamburgerLineOpen: cn("opacity-0"),
  hamburgerLineClosed: cn("opacity-100"),
  hamburgerMiddleContainer: cn("relative"),
  hamburgerLineMiddle: cn(
    "bg-secondary block transition-all duration-300 ease-out absolute top-0 right-0 h-0.5 w-[28px] rounded-sm",
  ),
  hamburgerLineMiddleLeftOpen: cn("rotate-45"),
  hamburgerLineMiddleRightOpen: cn("-rotate-45"),
  hamburgerLineMiddleClosed: cn(""),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
