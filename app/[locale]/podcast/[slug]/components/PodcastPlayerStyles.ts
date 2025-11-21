/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn(
    "grid grid-rows-[auto_1fr]",
    "h-[calc(100vh-155px)] max-w-[800px] mx-auto",
    "px-4 md:px-8 lg:px-10 py-4 md:py-6 lg:py-8 gap-4 md:gap-6",
    "overflow-hidden",
  ),
  topGrid: cn("grid grid-rows-[auto_auto_auto]", "gap-4 md:gap-6", "w-full", "relative"),
  transcriptToggleContainer: cn("absolute bottom-0 right-0 z-20", "md:hidden"),
  transcriptToggleButton: cn(
    "p-2! w-10! h-10! flex items-center justify-center",
    "bg-primary border border-secondary",
    "hover:bg-secondary hover:text-primary",
    "transition-colors duration-150",
  ),
  transcriptToggleIcon: cn("w-5 h-5 text-secondary"),
  headerSection: cn("flex flex-col md:flex-row gap-4 md:gap-6", "p-4 md:p-6 w-full"),
  coverWrapper: cn(
    "relative w-full md:w-[200px] lg:w-[250px] aspect-square shrink-0",
    "border border-secondary overflow-hidden",
  ),
  coverImage: cn("object-cover"),
  infoSection: cn("flex flex-col justify-center gap-2 flex-1"),
  title: cn("text-xl md:text-2xl lg:text-3xl font-bold leading-tight"),
  author: cn("text-sm md:text-base text-secondary/80"),
  category: cn("text-xs md:text-sm uppercase tracking-wide text-secondary/60"),
  playerSection: cn("flex flex-col gap-4 md:gap-6", "p-4 md:p-6 w-full"),
  buttons: cn("flex items-center justify-center gap-2 md:gap-4 relative"),
  buttonGroup: cn("flex items-center gap-2"),
  controlButton: cn(
    "p-0! w-10! h-10! md:w-12! md:h-12! flex items-center justify-center",
    "bg-primary border border-secondary hover:bg-secondary",
    "transition-colors duration-150",
  ),
  playButton: cn(
    "p-0! w-14! h-14! md:w-16! md:h-16! lg:w-18! lg:h-18!",
    "flex items-center justify-center border border-secondary",
    "bg-primary hover:bg-secondary",
    "transition-colors duration-150",
  ),
  icon: cn("text-base md:text-lg text-secondary hover:text-primary transition-colors duration-150"),
  playIcon: cn(
    "text-xl md:text-2xl lg:text-3xl text-secondary hover:text-primary ml-0.5 transition-colors duration-150",
  ),
  progressContainer: cn("flex items-center gap-3 md:gap-4 w-full"),
  progressBar: cn(
    "flex-1 h-1 md:h-1.5 bg-secondary/20 appearance-none cursor-pointer",
    "focus:outline-none focus:ring-0",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
    "[&::-webkit-slider-thumb]:md:h-4 [&::-webkit-slider-thumb]:md:w-4",
    "[&::-webkit-slider-thumb]:bg-secondary",
    "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0",
    "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3",
    "[&::-moz-range-thumb]:md:h-4 [&::-moz-range-thumb]:md:w-4",
    "[&::-moz-range-thumb]:bg-secondary",
    "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0",
  ),
  time: cn("text-xs md:text-sm min-w-[40px] md:min-w-[45px] text-center text-secondary/80"),
  expandedControl: cn("flex items-center gap-2 overflow-hidden", "min-w-[120px] md:min-w-[150px]"),
  controlSlider: cn(
    "h-1 md:h-1.5 bg-secondary/20 appearance-none cursor-pointer",
    "focus:outline-none focus:ring-0",
    "w-[80px] md:w-[100px]",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
    "[&::-webkit-slider-thumb]:md:h-4 [&::-webkit-slider-thumb]:md:w-4",
    "[&::-webkit-slider-thumb]:bg-secondary",
    "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0",
    "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3",
    "[&::-moz-range-thumb]:md:h-4 [&::-moz-range-thumb]:md:w-4",
    "[&::-moz-range-thumb]:bg-secondary",
    "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0",
  ),
  controlValue: cn(
    "text-xs md:text-sm min-w-[35px] md:min-w-[40px] text-center text-secondary/80 shrink-0",
  ),
  transcriptSection: cn(
    "p-4 md:p-6 w-full",
    "flex justify-center",
    "overflow-hidden",
    "min-h-0",
    "relative",
  ),
  transcriptContent: cn(
    "flex flex-col gap-3 md:gap-4",
    "w-full",
    "relative",
    "overflow-y-scroll",
    "h-full",
    "[&::-webkit-scrollbar]:hidden",
    "[-ms-overflow-style]:none",
    "[scrollbar-width]:none",
  ),
  segmentWrapper: cn("relative"),
  transcriptFadeTop: cn(
    "absolute top-0 left-0 right-0 h-16",
    "bg-gradient-to-b from-primary to-transparent",
    "pointer-events-none z-10",
  ),
  transcriptFadeBottom: cn(
    "absolute bottom-0 left-0 right-0 h-16",
    "bg-gradient-to-t from-primary to-transparent",
    "pointer-events-none z-10",
  ),
  emptyBlock: cn("h-8"),
  segment: cn("text-sm md:text-base leading-relaxed text-secondary/50"),
  segmentActive: cn("text-base md:text-lg leading-relaxed"),
  segmentFade: cn("text-sm md:text-base leading-relaxed opacity-40"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
