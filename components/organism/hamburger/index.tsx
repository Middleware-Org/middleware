"use client";

/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import { useMenu } from "@/store/useMenu";
import type { CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface HamburgerProps {
  dict: Pick<CommonDictionary, "aria">;
}

/* **************************************************
 * Hamburger
 **************************************************/
export default function Hamburger({ dict }: HamburgerProps) {
  const { isOpen, toggleMenu } = useMenu();

  return (
    <button
      onClick={toggleMenu}
      className={styles.hamburger}
      aria-label={isOpen ? dict.aria.hamburger.close : dict.aria.hamburger.open}
      aria-expanded={isOpen}
      aria-controls="app-menu"
    >
      <span
        className={cn(
          styles.hamburgerLine,
          isOpen ? styles.hamburgerLineOpen : styles.hamburgerLineClosed,
        )}
      ></span>
      <div className={styles.hamburgerMiddleContainer}>
        <span
          className={cn(
            styles.hamburgerLineMiddle,
            isOpen ? styles.hamburgerLineMiddleLeftOpen : styles.hamburgerLineMiddleClosed,
          )}
        ></span>
        <span
          className={cn(
            styles.hamburgerLineMiddle,
            isOpen ? styles.hamburgerLineMiddleRightOpen : styles.hamburgerLineMiddleClosed,
          )}
        ></span>
      </div>
      <span
        className={cn(
          styles.hamburgerLine,
          isOpen ? styles.hamburgerLineOpen : styles.hamburgerLineClosed,
        )}
      ></span>
    </button>
  );
}
