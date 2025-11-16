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

/* **************************************************
 * Imports
 **************************************************/
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
    <nav className="flex items-center border-r border-secondary h-full">
      {headerLinks.map((headerLink) => {
        const isActive = pathname?.includes(headerLink.href) || false;
        return (
          <div
            key={headerLink.label}
            className={cn(
              mobile && !headerLink.in_evidence ? "lg:flex md:flex hidden" : "flex",
              headerLink.in_evidence ? "bg-secondary text-primary" : "",
              isActive ? "bg-tertiary text-white" : "",
              " border-l border-secondary h-full items-center px-3 hover:bg-tertiary hover:text-white transition-all duration-150 cursor-pointer",
            )}
          >
            <Link href={headerLink.href}>
              <MonoTextLight className="text-xs md:text-base">
                {dict.aria.header[headerLink.label as keyof typeof dict.aria.header]}
              </MonoTextLight>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
