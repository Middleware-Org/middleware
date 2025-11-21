/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import { TypographyProps } from "./types";
import { editorBold, editorRegular, gtAmericaMonoBold, gtAmericaMonoLight } from "./fonts";
import styles from "./styles";

/* **************************************************
 * Components
 **************************************************/
export function H1({ children, className = "", style }: TypographyProps) {
  return (
    <h1 style={style} className={cn(editorBold.className, styles.h1, className)}>
      {children}
    </h1>
  );
}

export function H2({ children, className = "", style }: TypographyProps) {
  return (
    <h2 style={style} className={cn(editorRegular.className, styles.h2, className)}>
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: TypographyProps) {
  return <h3 className={cn(editorBold.className, styles.h3, className)}>{children}</h3>;
}

export function MonoTextBold({ children, className = "", style }: TypographyProps) {
  return (
    <p style={style} className={cn(gtAmericaMonoBold.className, className)}>
      {children}
    </p>
  );
}

export function MonoTextLight({ children, className = "", onClick, style }: TypographyProps) {
  return (
    <p style={style} className={cn(gtAmericaMonoLight.className, className)} onClick={onClick}>
      {children}
    </p>
  );
}

export function SerifText({ children, className = "", style }: TypographyProps) {
  return (
    <p style={style} className={cn(editorRegular.className, className)}>
      {children}
    </p>
  );
}

export function SerifTextBold({ children, className = "" }: TypographyProps) {
  return <p className={cn(editorBold.className, className)}>{children}</p>;
}
