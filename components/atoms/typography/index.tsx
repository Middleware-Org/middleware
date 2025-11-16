/* **************************************************
 * Imports
 **************************************************/
import { Lexend } from "next/font/google";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type TypographyProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  as?: "h1" | "h2" | "h3" | "span" | "p";
};

/* **************************************************
 * Utils
 **************************************************/
const getFontFamily = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("fontFamily") || "standard";
  }
  return "standard";
};

/* **************************************************
 * Google Fonts
 **************************************************/
export const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* **************************************************
 * Local Fonts
 **************************************************/
export const editorRegular = localFont({
  src: [
    {
      path: "../../../fonts/EditorRegular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

export const editorBold = localFont({
  src: [
    {
      path: "../../../fonts/EditorBold.otf",
      weight: "300",
      style: "normal",
    },
  ],
  display: "swap",
});

export const gtAmericaMonoBold = localFont({
  src: [
    {
      path: "../../../fonts/GT-America-Mono-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const gtAmericaMonoLight = localFont({
  src: [
    {
      path: "../../../fonts/GT-America-Mono-Light.otf",
      weight: "300",
      style: "normal",
    },
  ],
  display: "swap",
});

/* **************************************************
 * Typography
 **************************************************/
export function H1({ children, className = "", as: Component = "h1", style }: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass = fontFamily === "accessibility" ? lexend.className : editorBold.className;

  return (
    <Component
      style={style}
      className={cn(fontClass, className, "lg:text-5xl md:text-4xl text-3xl font-bold")}
    >
      {children}
    </Component>
  );
}

export function H2({ children, className = "", style, as: Component = "h2" }: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass = fontFamily === "accessibility" ? lexend.className : editorRegular.className;

  return (
    <Component style={style} className={cn(fontClass, className, "lg:text-[32px] text-[28px]")}>
      {children}
    </Component>
  );
}

export function H3({ children, className = "", as: Component = "h3" }: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass = fontFamily === "accessibility" ? lexend.className : editorBold.className;

  return <Component className={cn(fontClass, className, "text-xl")}>{children}</Component>;
}

export function MonoTextBold({
  children,
  className = "",
  as: Component = "span",
}: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass = fontFamily === "accessibility" ? lexend.className : gtAmericaMonoBold.className;

  return <Component className={cn(fontClass, className)}>{children}</Component>;
}

export function MonoTextLight({
  children,
  onClick,
  className = "",
  as: Component = "span",
}: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass =
    fontFamily === "accessibility" ? lexend.className : gtAmericaMonoLight.className;

  return (
    <Component onClick={onClick} className={cn(fontClass, className)}>
      {children}
    </Component>
  );
}

export function SerifText({ children, className = "", as: Component = "span" }: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass = fontFamily === "accessibility" ? lexend.className : editorRegular.className;

  return <Component className={cn(fontClass, className)}>{children}</Component>;
}

export function SerifTextBold({
  children,
  className = "",
  as: Component = "span",
}: TypographyProps) {
  const fontFamily = getFontFamily();
  const fontClass = fontFamily === "accessibility" ? lexend.className : editorBold.className;

  return <Component className={cn(fontClass, className)}>{children}</Component>;
}
