"use client";

/* **************************************************
 * Imports
 **************************************************/
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";
import { useMenu } from "@/store/useMenu";
import { menuItems } from "@/lib/data/links";
import { MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import Pictogram from "../pictogram";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type MenuProps = {
  dict: Pick<CommonDictionary, "aria" | "meta" | "title">;
};

/* **************************************************
 * Menu
 **************************************************/
export default function Menu({ dict }: MenuProps) {
  const { isOpen, closeMenu } = useMenu();
  const pathname = usePathname();

  /* **************************************************
   * Effects
   **************************************************/
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  /* **************************************************
   * Helpers
   **************************************************/
  function getPathnameWithoutLang(pathname: string | null) {
    if (!pathname) {
      return "/";
    }
    const pathnameWithoutLang = pathname.split("/").slice(2).join("/");
    if (pathnameWithoutLang === "") {
      return "/";
    }
    return `/${pathnameWithoutLang}`;
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div
      className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}
      id="app-menu"
      role="dialog"
      aria-label={dict.aria.menu.middleware}
      aria-modal="true"
    >
      <nav className={styles.navMain} role="navigation">
        {menuItems.map((item) => {
          const pathnameWithoutLang = getPathnameWithoutLang(pathname);
          const isActive = pathnameWithoutLang === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <MonoTextLight
                onClick={closeMenu}
                className={cn(styles.linkMain, isActive ? styles.linkActive : "")}
              >
                {dict.aria.menu[item.label as keyof typeof dict.aria.menu]}
              </MonoTextLight>
            </Link>
          );
        })}
      </nav>
      <Separator />
      <nav className={styles.navMobile} role="navigation">
        {menuItems.map((item) => {
          const pathnameWithoutLang = getPathnameWithoutLang(pathname);
          const isActive = pathnameWithoutLang === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <MonoTextLight
                onClick={closeMenu}
                className={cn(styles.linkMobile, isActive ? styles.linkActive : "")}
              >
                {dict.aria.header[item.label as keyof typeof dict.aria.header]}
              </MonoTextLight>
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <Pictogram />
        <MonoTextBold className={styles.title}>{dict.title}</MonoTextBold>
        <MonoTextLight className={styles.quote}>&ldquo;{dict.aria.menu.quote}&rdquo;</MonoTextLight>
        <MonoTextLight className={styles.footerQuote}>{dict.aria.menu.footer_quote}</MonoTextLight>
      </div>
    </div>
  );
}
