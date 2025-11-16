/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import { TypographyProps } from "./types";
import { editorBold, editorRegular, gtAmericaMonoBold, gtAmericaMonoLight } from "./fonts";

/* **************************************************
 * Components
 **************************************************/
export function H1({ children, className = "", style }: TypographyProps) {
  return (
    <h1
      style={style}
      className={cn(editorBold.className, className, "lg:text-5xl md:text-4xl text-3xl font-bold")}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "", style }: TypographyProps) {
  return (
    <h2
      style={style}
      className={cn(editorRegular.className, className, "lg:text-[32px] text-[28px]")}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: TypographyProps) {
  return <h3 className={cn(editorBold.className, className, "text-xl")}>{children}</h3>;
}

export function MonoTextBold({ children, className = "" }: TypographyProps) {
  return <p className={cn(gtAmericaMonoBold.className, className)}>{children}</p>;
}

export function MonoTextLight({ children, className = "" }: TypographyProps) {
  return <p className={cn(gtAmericaMonoLight.className, className)}>{children}</p>;
}

export function SerifText({ children, className = "" }: TypographyProps) {
  return <p className={cn(editorRegular.className, className)}>{children}</p>;
}

export function SerifTextBold({ children, className = "" }: TypographyProps) {
  return <p className={cn(editorBold.className, className)}>{children}</p>;
}
