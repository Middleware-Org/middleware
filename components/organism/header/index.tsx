/* **************************************************
 * Imports
 **************************************************/
import Logo from "@/components/organism/logo";
import Hamburger from "@/components/organism/hamburger";
import Nav from "@/components/organism/nav";
import styles from "./styles";
import type { CommonDictionary } from "@/lib/i18n/types";

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
        <Logo dict={dict} />
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
