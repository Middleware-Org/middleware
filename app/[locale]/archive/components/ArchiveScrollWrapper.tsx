"use client";

import { cn } from "@/lib/utils/classes";
import HorizontalScroll from "@/components/molecules/HorizontalScroll";
import { useIsMobile } from "@/hooks/useMediaQuery";

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
  const isMobile = useIsMobile();

  return (
    <HorizontalScroll
      enabled={!isMobile}
      stickyOffset={stickyOffset}
      className={cn(className, isMobile ? "" : "")}
      innerClassName={cn(innerClassName, isMobile ? "" : "")}
    >
      {children}
    </HorizontalScroll>
  );
}
