"use client";

/* **************************************************
 * Imports
 **************************************************/
import Logo from "@/components/organism/logo";
import Hamburger from "@/components/organism/hamburger";
import Nav from "@/components/organism/nav";
import styles from "./styles";
import type { CommonDictionary } from "@/lib/i18n/types";
import { useIsMobile } from "@/hooks/useMediaQuery";

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
  const isMobile = useIsMobile();

  const logoSize = isMobile ? 40 : 48;
  return (
    <header className={styles.header}>
      <div className={styles.headerTopSub}>
        <Logo size={logoSize} dict={dict} />
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
