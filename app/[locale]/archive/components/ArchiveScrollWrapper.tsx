"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/classes";
import HorizontalScroll from "@/components/molecules/HorizontalScroll";

type ArchiveScrollWrapperProps = {
  children: React.ReactNode;
  stickyOffset?: number;
  className?: string;
  innerClassName?: string;
};

export default function ArchiveScrollWrapper({
  children,
  stickyOffset = 155,
  className,
  innerClassName,
}: ArchiveScrollWrapperProps) {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    function checkScreenSize() {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    }

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
