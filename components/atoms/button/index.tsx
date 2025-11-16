import { cn } from "@/lib/utils/classes";

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

export default function Button({
  children,
  className,
  type = "button",
  style,
  variants = "primary",
  ...props
}: Props) {
  return (
    <button
      type={type}
      aria-label={props.ariaLabel}
      aria-pressed={props.ariaPressed}
      title={props.title}
      {...props}
      className={cn(
        className ? className : "",
        "px-4 py-2 w-full cursor-pointer",
        variants === "primary" ? "bg-primary text-secondary border-secondary border" : "",
        variants === "secondary" ? "bg-secondary text-primary" : "",
        variants === "tertiary" ? "bg-tertiary text-white border-secondary border" : "",
        variants === "unstyled" ? "bg-transparent text-secondary" : "",
      )}
      style={style}
    >
      {children}
    </button>
  );
}
