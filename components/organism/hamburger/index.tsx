"use client";

import { cn } from "@/lib/utils/classes";
/* **************************************************
 * Imports
 **************************************************/
import styles from "./styles";
import { useMenu } from "@/store/useMenu";

/* **************************************************
 * Imports
 **************************************************/
import type { CommonDictionary } from "@/lib/i18n/types";

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
      <div className="relative">
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
