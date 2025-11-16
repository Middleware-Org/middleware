/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type SeparatorProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  size?: "thin" | "thick";
};

/* **************************************************
 * Separator
 **************************************************/
export default function Separator({
  className = "",
  orientation = "horizontal",
  size = "thin",
}: SeparatorProps) {
  const sizeClass = size === "thin" ? styles.sizeThin : styles.sizeThick;
  const orientationClass =
    orientation === "horizontal" ? styles.orientationHorizontal : styles.orientationVertical;

  return (
    <div className={cn(styles.base, sizeClass, orientationClass, className)} />
  );
}
