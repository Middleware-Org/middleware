/* **************************************************
 * Imports
 **************************************************/
"use client";

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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { MonoTextBold } from "@/components/atoms/typography";
import Pictogram from "@/components/organism/pictogram";
import { authClient } from "@/lib/auth/client";
import { stripLocalePrefix, withLocale } from "@/lib/i18n/path";
import type { AdminDictionary, CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";

import MergeButton from "./MergeButton";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface SidebarProps {
  dict: Pick<CommonDictionary, "title">;
  adminDict: Pick<AdminDictionary, "sidebar" | "mergeButton">;
  locale: string;
  currentUserRole: "ADMIN" | "EDITOR";
}

/* **************************************************
 * Navigation Items (Static - Outside Component)
 **************************************************/
const navItems = [
  {
    href: "/admin",
    labelKey: "dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/articles",
    labelKey: "articles",
    icon: FileText,
  },
  {
    href: "/admin/podcasts",
    labelKey: "podcasts",
    icon: Headphones,
  },
  {
    href: "/admin/media",
    labelKey: "media",
    icon: ImageIcon,
  },
  {
    href: "/admin/issues",
    labelKey: "issues",
    icon: BookOpen,
  },
  {
    href: "/admin/pages",
    labelKey: "pages",
    icon: FileCode,
  },
  {
    href: "/admin/categories",
    labelKey: "categories",
    icon: FolderTree,
  },
  {
    href: "/admin/authors",
    labelKey: "authors",
    icon: User,
  },
  {
    href: "/admin/users",
    labelKey: "users",
    icon: Users,
  },
] as const;

/* **************************************************
 * Sidebar Component
 **************************************************/
export default function Sidebar({ dict, adminDict, locale, currentUserRole }: SidebarProps) {
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
                    {adminDict.sidebar[item.labelKey]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {currentUserRole === "ADMIN" && <MergeButton dict={adminDict.mergeButton} />}

      <div className={styles.footer}>
        <button type="button" onClick={handleLogout} className={styles.logoutButton}>
          <LogOut className={styles.navIcon} />
          <span>{adminDict.sidebar.logout}</span>
        </button>
      </div>
    </aside>
  );
}
