"use client";

/* **************************************************
 * Imports
 **************************************************/
import { usePathname } from "next/navigation";
import { MonoTextLight } from "@/components/atoms/typography";
import { headerLinks } from "@/lib/data/links";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/classes";
import Link from "next/link";
import styles from "./styles";
import type { CommonDictionary } from "@/lib/i18n/types";

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

  const mobile = useIsMobile();

  return (
    <nav className={styles.nav}>
      {headerLinks.map((headerLink) => {
        const isActive = pathname?.includes(headerLink.href) || false;
        return (
          <div
            key={headerLink.label}
            className={cn(
              styles.linkContainer,
              mobile && !headerLink.in_evidence
                ? styles.linkContainerMobile
                : styles.linkContainerVisible,
              headerLink.in_evidence ? styles.linkContainerHighlighted : "",
              isActive ? styles.linkContainerActive : "",
            )}
          >
            <Link href={headerLink.href}>
              <MonoTextLight
                className={cn(
                  styles.linkText,
                  headerLink.in_evidence ? styles.linkTextHighlighted : "",
                )}
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
