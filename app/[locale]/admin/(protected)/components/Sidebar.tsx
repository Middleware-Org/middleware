/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  BookOpen,
  Image as ImageIcon,
  FileText,
  FileCode,
  LogOut,
  Headphones,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/classes";
import { authClient } from "@/lib/auth/client";
import { stripLocalePrefix, withLocale } from "@/lib/i18n/path";
import Pictogram from "@/components/organism/pictogram";
import { MonoTextBold } from "@/components/atoms/typography";
import type { CommonDictionary } from "@/lib/i18n/types";
import MergeButton from "./MergeButton";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface SidebarProps {
  dict: Pick<CommonDictionary, "title">;
  locale: string;
  currentUserRole: "ADMIN" | "EDITOR";
}

/* **************************************************
 * Navigation Items (Static - Outside Component)
 **************************************************/
const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/articles",
    label: "Articoli",
    icon: FileText,
  },
  {
    href: "/admin/podcasts",
    label: "Podcasts",
    icon: Headphones,
  },
  {
    href: "/admin/media",
    label: "Media",
    icon: ImageIcon,
  },
  {
    href: "/admin/issues",
    label: "Issues",
    icon: BookOpen,
  },
  {
    href: "/admin/pages",
    label: "Pagine",
    icon: FileCode,
  },
  {
    href: "/admin/categories",
    label: "Categorie",
    icon: FolderTree,
  },
  {
    href: "/admin/authors",
    label: "Autori",
    icon: User,
  },
  {
    href: "/admin/users",
    label: "Utenti",
    icon: Users,
  },
] as const;

/* **************************************************
 * Sidebar Component
 **************************************************/
export default function Sidebar({ dict, locale, currentUserRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push(withLocale("/admin/login", locale));
  }

  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/admin/users" && currentUserRole !== "ADMIN") {
      return false;
    }
    return true;
  });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Pictogram size={40} />
          <Link href={`/${locale}/admin`}>
            <MonoTextBold className={styles.logoText}>{dict.title}</MonoTextBold>
          </Link>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathnameWithoutLocale === "/admin" || pathnameWithoutLocale === "/admin/"
                : pathnameWithoutLocale === item.href ||
                  pathnameWithoutLocale.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={withLocale(item.href, locale)}
                  className={cn(
                    styles.navItem,
                    isActive ? styles.navItemActive : styles.navItemInactive,
                  )}
                >
                  <Icon className={styles.navIcon} />
                  <span className={isActive ? styles.navItemActiveText : styles.navItemText}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MergeButton />

      <div className={styles.footer}>
        <button type="button" onClick={handleLogout} className={styles.logoutButton}>
          <LogOut className={styles.navIcon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
