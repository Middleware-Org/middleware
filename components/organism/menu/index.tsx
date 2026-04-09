"use client";

/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import FocusLock from "react-focus-lock";

import Separator from "@/components/atoms/separetor";
import { MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import { headerLinks, menuItems } from "@/lib/data/links";
import { useLocalizedPath } from "@/lib/i18n/client";
import type { CommonDictionary } from "@/lib/i18n/types";
import { useMenu } from "@/lib/store";
import { cn } from "@/lib/utils/classes";

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
  const toLocale = useLocalizedPath();

  const pathnameWithoutLang = getPathnameWithoutLang(pathname);

  const handleMenuLinkSelect = () => {
    closeMenu();
  };

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

  // Close menu on ESC key press
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, closeMenu]);

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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(styles.overlay, isOpen ? styles.overlayOpen : styles.overlayClosed)}
        onClick={closeMenu}
        aria-hidden="true"
      />
      {/* Menu with Focus Lock */}
      <FocusLock disabled={!isOpen} returnFocus>
        <div
          className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}
          id="app-menu"
          role="dialog"
          aria-label={dict.aria.menu.middleware}
          aria-modal="true"
        >
          <nav className={styles.navMain} role="navigation">
            {menuItems.map((item) => {
              const isActive = pathnameWithoutLang === item.href;
              return (
                <Link key={item.href} href={toLocale(item.href)} onClick={handleMenuLinkSelect}>
                  <MonoTextLight className={cn(styles.linkMain, isActive ? styles.linkActive : "")}>
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
              const isActive = pathnameWithoutLang === item.href;
              return (
                <Link key={item.href} href={toLocale(item.href)} onClick={handleMenuLinkSelect}>
                  <MonoTextLight className={cn("text-lg", isActive ? "text-tertiary" : "")}>
                    {dict.aria.header[item.label as keyof typeof dict.aria.header]}
                  </MonoTextLight>
                </Link>
              );
            })}
          </nav>
          <div className={styles.footer}>
            <Pictogram onClick={handleMenuLinkSelect} />
            <MonoTextBold className={styles.title}>{dict.title}</MonoTextBold>
            <MonoTextLight className={styles.quote}>
              &ldquo;{dict.aria.menu.quote}&rdquo;
            </MonoTextLight>
            <MonoTextLight className={styles.footerQuote}>
              {dict.aria.menu.footer_quote}
            </MonoTextLight>
          </div>
        </div>
      </FocusLock>
    </>
  );
}
