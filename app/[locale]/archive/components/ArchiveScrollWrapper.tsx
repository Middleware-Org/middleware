"use client";

import { useCallback, useEffect, useState } from "react";

import HorizontalScroll from "@/components/molecules/HorizontalScroll";
import { HEADER_HEIGHT } from "@/lib/constants/layout";
import { cn } from "@/lib/utils/classes";

type ArchiveScrollWrapperProps = {
  children: React.ReactNode;
  stickyOffset?: number;
  className?: string;
  innerClassName?: string;
};

export default function ArchiveScrollWrapper({
  children,
  stickyOffset = HEADER_HEIGHT.desktop,
  className,
  innerClassName,
}: ArchiveScrollWrapperProps) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });

  const checkScreenSize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
  }, []);

  useEffect(() => {
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [checkScreenSize]);

  return (
    <HorizontalScroll
      enabled={isDesktop}
      stickyOffset={stickyOffset}
      className={cn(className)}
      innerClassName={cn(innerClassName)}
    >
      {children}
    </HorizontalScroll>
  );
}
