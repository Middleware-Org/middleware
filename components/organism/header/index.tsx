/* **************************************************
 * Imports
 **************************************************/
import Logo from "@/components/organism/logo";
import Hamburger from "@/components/organism/hamburger";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface HeaderProps {
  children: React.ReactNode;
  dict: {
    title: string;
    aria: {
      hamburger: {
        open: string;
        close: string;
      };
    };
  };
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
          {/* <HeaderNav dict={dict} /> */}
        </div>
      </div>
    </header>
  );
}
