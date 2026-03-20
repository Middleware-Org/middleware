"use client";

/* **************************************************
 * Imports
 **************************************************/
import Hamburger from "@/components/organism/hamburger";
import Logo from "@/components/organism/logo";
import Nav from "@/components/organism/nav";
import type { CommonDictionary } from "@/lib/i18n/types";

import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface HeaderProps {
  children: React.ReactNode;
  dict: CommonDictionary;
}

/* **************************************************
 * Header
 **************************************************/
export default function Header({ children, dict }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTopSub}>
        <div className="scale-[0.833] md:scale-100 origin-left">
          <Logo size={48} dict={dict} />
        </div>
        <Hamburger dict={dict} />
      </div>
      <div className={styles.headerBottomSub}>
        <div className={styles.headerBottomSubContent}>
          {children}
          <Nav dict={dict} />
        </div>
      </div>
    </header>
  );
}
