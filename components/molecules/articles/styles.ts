/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  desktop: cn("hidden lg:block md:block lg:p-0 md:p-0 p-4 relative"),
  grid: cn("grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4"),
  mobile: cn("lg:hidden md:hidden"),
  mobileWithPadding: cn("lg:hidden md:hidden p-4"),
  mobileWithoutPadding: cn("lg:hidden md:hidden p-0"),
  mobileGrid: cn("grid grid-cols-1 gap-4"),
  buttonContainer: cn("lg:hidden md:hidden pb-4 px-4"),
  buttonContainerOpen: cn("lg:hidden md:hidden py-4 px-4"),
  button: cn("w-full p-4 bg-transparent border"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
