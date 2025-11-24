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
} from "lucide-react";
import { cn } from "@/lib/utils/classes";
import { authClient } from "@/lib/auth/client";
import { i18nSettings } from "@/lib/i18n/settings";
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
}

/* **************************************************
 * Sidebar Component
 **************************************************/
export default function Sidebar({ dict, locale }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/admin/login");
  }

  // Rimuove il locale dal pathname (es. /it/admin -> /admin)
  function getPathnameWithoutLocale(path: string): string {
    const segments = path.split("/").filter(Boolean);
    // Se il primo segmento è un locale supportato, rimuovilo
    if (segments.length > 0 && i18nSettings.locales.includes(segments[0])) {
      return "/" + segments.slice(1).join("/");
    }
    return path;
  }

  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/categories",
      label: "Categorie",
      icon: FolderTree,
    },
    {
      href: "/admin/authors",
      label: "Autori",
      icon: Users,
    },
    {
      href: "/admin/issues",
      label: "Issues",
      icon: BookOpen,
    },
    {
      href: "/admin/media",
      label: "Media",
      icon: ImageIcon,
    },
    {
      href: "/admin/articles",
      label: "Articoli",
      icon: FileText,
    },
    {
      href: "/admin/pages",
      label: "Pagine",
      icon: FileCode,
    },
  ];

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
          {navItems.map((item) => {
            const Icon = item.icon;
            // Per "/admin", deve essere attivo solo se il pathname è esattamente "/admin" o "/admin/"
            // Per gli altri link, devono essere attivi se il pathname inizia con il loro href
            const isActive =
              item.href === "/admin"
                ? pathnameWithoutLocale === "/admin" || pathnameWithoutLocale === "/admin/"
                : pathnameWithoutLocale === item.href ||
                  pathnameWithoutLocale.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    styles.navItem,
                    isActive ? styles.navItemActive : styles.navItemInactive,
                  )}
                >
                  <Icon className={styles.navIcon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <MergeButton />
        <button type="button" onClick={handleLogout} className={styles.logoutButton}>
          <LogOut className={styles.navIcon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
