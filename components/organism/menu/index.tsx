"use client";

/* **************************************************
 * Imports
 **************************************************/
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";
import { useMenu } from "@/lib/store";
import { headerLinks, menuItems } from "@/lib/data/links";
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
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
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

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(styles.overlay, isOpen ? styles.overlayOpen : styles.overlayClosed)}
        onClick={closeMenu}
        aria-hidden="true"
      />
      {/* Menu */}
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
        <nav
          className="flex flex-col gap-2 flex-1 justify-center items-end lg:hidden"
          role="navigation"
        >
          {headerLinks.map((item) => {
            const pathnameWithoutLang = getPathnameWithoutLang(pathname);
            const isActive = pathnameWithoutLang === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <MonoTextLight
                  onClick={() => closeMenu()}
                  className={cn("text-lg", isActive ? "text-tertiary" : "")}
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
          <MonoTextLight className={styles.quote}>
            &ldquo;{dict.aria.menu.quote}&rdquo;
          </MonoTextLight>
          <MonoTextLight className={styles.footerQuote}>
            {dict.aria.menu.footer_quote}
          </MonoTextLight>
        </div>
      </div>
    </>
  );
}
