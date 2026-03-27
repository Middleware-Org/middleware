/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-4 lg:px-10 py-0 lg:py-10"),
  mobileToggle: cn(
    "lg:hidden md:flex flex sticky top-[95px] md:top-[115px] pt-[20px] pb-[20px] bg-primary w-full",
  ),
  grid: cn("grid grid-cols-1 lg:grid-cols-[295px_auto] gap-10"),
  sidebar: cn("lg:sticky lg:top-[155px] lg:h-fit"),
  content: cn("flex flex-col gap-10"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
