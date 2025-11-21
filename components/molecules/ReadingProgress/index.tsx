"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/classes";

interface ReadingProgressProps {
  color?: string;
  height?: string;
  className?: string;
}

export default function ReadingProgress({
  color = "bg-tertiary",
  height = "h-1.5",
  className = "",
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(Math.max(scrollPercent, 0), 100));
    };

    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledUpdate);
    updateProgress();

    return () => window.removeEventListener("scroll", throttledUpdate);
  }, []);

  return (
    <div className={cn(height, className, "fixed top-0 left-0 w-full z-50 bg-primary")}>
      <div className={cn(height, color)} style={{ width: `${progress}%` }} />
    </div>
  );
}
