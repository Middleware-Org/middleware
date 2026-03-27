/* **************************************************
 * Imports
 **************************************************/
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type SidebarPageLayoutProps = {
  mobileToggle: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

/* **************************************************
 * SidebarPageLayout
 **************************************************/
export default function SidebarPageLayout({
  mobileToggle,
  sidebar,
  children,
}: SidebarPageLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.mobileToggle}>{mobileToggle}</div>
      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <div className="hidden lg:block">{sidebar}</div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
