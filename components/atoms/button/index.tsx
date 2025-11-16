/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variants?: "primary" | "secondary" | "tertiary" | "unstyled";
  style?: React.CSSProperties;
  ariaLabel?: string;
  ariaPressed?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
};

/* **************************************************
 * Button
 **************************************************/
export default function Button({
  children,
  className,
  type = "button",
  style,
  variants = "primary",
  ...props
}: Props) {
  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    unstyled: styles.unstyled,
  };

  return (
    <button
      type={type}
      aria-label={props.ariaLabel}
      aria-pressed={props.ariaPressed}
      title={props.title}
      {...props}
      className={cn(styles.base, variantStyles[variants], className ?? "")}
      style={style}
    >
      {children}
    </button>
  );
}
