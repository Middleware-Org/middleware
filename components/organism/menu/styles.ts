/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  overlay: cn(
    "fixed inset-0 bg-transparent z-40 transition-opacity duration-300 ease-in-out",
  ),
  overlayOpen: cn("opacity-100 pointer-events-auto"),
  overlayClosed: cn("opacity-0 pointer-events-none"),
  container: cn(
    "flex flex-col fixed top-[95px] md:top-[115px] lg:top-[115px] right-0 w-full lg:h-[calc(100dvh-115px)] md:h-[calc(100dvh-115px)] h-[calc(100dvh-95px)] bg-primary z-50 lg:max-w-[461px] md:max-w-[461px] max-w-none transition-transform duration-300 ease-in-out lg:border-l lg:border-secondary md:border-secondary md:border-secondary p-[60px]",
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
