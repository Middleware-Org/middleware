/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn(
    "flex flex-col fixed top-[115px] right-0 w-full h-[calc(100dvh-115px)] bg-primary z-50 lg:max-w-[461px] md:max-w-[461px] max-w-none transition-transform duration-300 ease-in-out border-l border-secondary p-[60px]",
  ),
  containerOpen: cn("translate-x-0"),
  containerClosed: cn("translate-x-full"),
  navMain: cn("flex flex-col gap-4 flex-1 justify-center items-end"),
  navMobile: cn("flex flex-col gap-2 flex-1 justify-center items-end lg:hidden md:hidden"),
  linkMain: cn("text-2xl hover:underline"),
  linkMobile: cn("text-lg"),
  linkActive: cn("text-tertiary"),
  footer: cn("flex flex-col gap-2 flex-1 justify-center items-start"),
  title: cn("text-lg"),
  quote: cn("text-xs italic"),
  footerQuote: cn("text-xs"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
