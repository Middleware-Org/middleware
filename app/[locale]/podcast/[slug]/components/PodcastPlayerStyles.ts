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
    "h-[calc(100vh-95px)] md:h-[calc(100vh-155px)] lg:h-[calc(100vh-155px)] max-w-[800px] mx-auto",
    "px-0 md:px-8 lg:px-10 py-0 md:py-6 lg:py-8 gap-0 md:gap-6 lg:gap-6",
    "overflow-hidden",
  ),
  topGrid: cn("grid grid-rows-[auto_auto_auto]", "gap-0 md:gap-0 lg:gap-6", "w-full", "relative"),
  transcriptToggleContainer: cn("flex items-center shrink-0", "md:hidden"),
  transcriptToggleButton: cn(
    "p-2! w-10! h-10! flex items-center justify-center",
    "bg-primary border border-secondary",
    "hover:bg-secondary hover:text-primary",
    "transition-colors duration-150",
  ),
  transcriptToggleIcon: cn("w-5 h-5 text-secondary"),
  headerSection: cn("flex flex-col md:flex-row gap-4 md:gap-6", "p-4 md:p-6 w-full"),
  coverWrapper: cn(
    "relative w-[150px] md:w-[200px] lg:w-[250px] aspect-square shrink-0",
    "border border-secondary overflow-hidden m-auto",
  ),
  coverImage: cn("object-cover"),
  infoSection: cn("flex flex-col justify-center flex-1"),
  infoContainer: cn(
    "flex justify-center md:justify-between lg:justify-between text-center md:text-left lg:text-left items-center",
  ),
  textContainer: cn("flex flex-col"),
  textFlexContainer: cn("flex items-center gap-2"),
  textTitle: cn("text-lg md:text-2xl lg:text-3xl font-bold leading-tight"),
  textAuthor: cn("text-xs md:text-xs lg:text-sm text-secondary/80"),
  titleContainer: cn("flex items-start justify-between gap-2 md:gap-4"),
  title: cn("text-lg md:text-2xl lg:text-3xl font-bold leading-tight flex-1"),
  category: cn(
    "text-xs md:text-sm lg:text-base uppercase tracking-wide text-secondary/60 hover:underline",
  ),
  textTTS: cn("text-[10px] text-secondary/60 hover:underline"),
  textDate: cn("text-xs text-secondary/60"),
  playerSection: cn("flex flex-col gap-4 md:gap-6", "p-2 md:p-6 lg:p-6 w-full", "relative"),
  volumeButtonWrapper: cn("relative"),
  speedButtonWrapper: cn("relative"),
  volumeControlContainer: cn(
    "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-[50px]",
    "bg-primary border border-secondary p-3 md:p-4",
    "max-w-[80px] md:max-w-[100px]",
  ),
  volumeControlContainerBottom: cn("top-full! mt-2! bottom-auto! mb-0!"),
  speedControlContainer: cn(
    "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-[50px]",
    "bg-primary border border-secondary p-3 md:p-4",
    "max-w-[80px] md:max-w-[100px]",
  ),
  speedControlContainerBottom: cn("top-full! mt-2! bottom-auto! mb-0!"),
  buttons: cn("flex items-center justify-center gap-2 md:gap-4 relative"),
  buttonGroup: cn("flex items-center gap-2"),
  controlButton: cn(
    "p-0! w-10! h-10! md:w-12! md:h-12! flex items-center justify-center",
    "bg-primary border border-secondary hover:bg-tertiary group",
    "transition-colors duration-150",
  ),
  playButton: cn(
    "p-0! w-14! h-14! md:w-16! md:h-16! lg:w-18! lg:h-18!",
    "flex items-center justify-center border border-secondary",
    "bg-primary hover:bg-tertiary group",
    "transition-colors duration-150",
  ),
  icon: cn("text-base md:text-lg text-secondary"),
  playIcon: cn("text-xl md:text-2xl lg:text-3xl text-secondary ml-0.5"),
  progressContainer: cn("flex items-center gap-3 md:gap-4 w-full px-4 py-2"),
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
    "flex flex-col justify-center",
    "overflow-hidden",
    "min-h-0",
    "relative",
  ),
  transcriptCloseContainer: cn("absolute top-4 right-4 z-20", "md:hidden"),
  transcriptCloseButton: cn(
    "p-2! w-10! h-10! flex items-center justify-center",
    "bg-primary! border border-secondary",
    "hover:bg-secondary hover:text-primary",
    "transition-colors duration-150",
  ),
  transcriptCloseIcon: cn("w-5 h-5 text-secondary"),
  transcriptContent: cn(
    "flex flex-col gap-3 md:gap-4",
    "w-full",
    "relative",
    "overflow-hidden",
    "h-full",
  ),
  transcriptContentInner: cn(
    "flex flex-col gap-3 md:gap-4",
    "w-full",
    "transition-transform duration-300 ease-out",
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
  citationFooter: cn("mt-4 pt-4 border-t border-secondary/20", "text-center"),
  citationText: cn("text-xs md:text-sm text-secondary/60 leading-relaxed"),
  citationLink: cn(
    "text-secondary/80 hover:text-tertiary underline transition-colors duration-150",
  ),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
