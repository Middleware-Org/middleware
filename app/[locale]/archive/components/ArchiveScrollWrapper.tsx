"use client";

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
  return (
    <HorizontalScroll
      enabled={true}
      stickyOffset={stickyOffset}
      className={cn(className)}
      innerClassName={cn(innerClassName)}
    >
      {children}
    </HorizontalScroll>
  );
}
