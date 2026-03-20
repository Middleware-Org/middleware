"use client";

/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MonoTextLight } from "@/components/atoms/typography";
import { headerLinks } from "@/lib/data/links";
import { useLocalizedPath } from "@/lib/i18n/client";
import type { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";

import styles from "./styles";


/* **************************************************
 * Types
 **************************************************/
interface NavProps {
  dict: Pick<CommonDictionary, "aria">;
}

/* **************************************************
 * Nav
 **************************************************/
export default function Nav({ dict }: NavProps) {
  const pathname = usePathname();
  const toLocale = useLocalizedPath();

  return (
    <nav className={cn(styles.nav)}>
      {headerLinks.map((headerLink) => {
        const isActive = pathname?.includes(headerLink.href) || false;
        return (
          <div
            key={headerLink.label}
            className={cn(styles.linkContainer, isActive ? styles.linkContainerActive : "")}
          >
            <Link href={toLocale(headerLink.href)}>
              <MonoTextLight
                className={cn(styles.linkText, isActive ? styles.linkTextHighlighted : "")}
              >
                {dict.aria.header[headerLink.label as keyof typeof dict.aria.header]}
              </MonoTextLight>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
