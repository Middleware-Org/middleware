"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type HorizontalScrollProps = {
  children: React.ReactNode;
  enabled?: boolean;
  stickyOffset?: number;
  className?: string;
  innerClassName?: string;
};

export default function HorizontalScroll({
  children,
  enabled = true,
  stickyOffset = 0,
  className,
  innerClassName,
}: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [scrollWidth, setScrollWidth] = useState(0);
  const [sectionHeight, setSectionHeight] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollWidth]);

  useLayoutEffect(() => {
    if (!enabled) return;

    function measure() {
      if (!sectionRef.current || !contentRef.current) return;

      const sectionEl = sectionRef.current;
      const contentEl = contentRef.current;

      const totalScrollWidth = contentEl.scrollWidth;
      const visibleWidth = sectionEl.clientWidth;
      const visibleHeight = sectionEl.offsetHeight;

      const horizontalDistance = Math.max(totalScrollWidth - visibleWidth, 0);

      setScrollWidth(horizontalDistance);
      setSectionHeight(visibleHeight + horizontalDistance);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [enabled]);

  if (!enabled) {
    const sectionClasses = ["relative", className].filter(Boolean).join(" ");
    const innerClasses = [innerClassName].filter(Boolean).join(" ");

    return (
      <section ref={sectionRef} className={sectionClasses}>
        <div className={innerClasses}>{children}</div>
      </section>
    );
  }

  const sectionClasses = ["relative", className].filter(Boolean).join(" ");
  const innerClasses = ["flex", innerClassName].filter(Boolean).join(" ");

  return (
    <section
      ref={sectionRef}
      className={sectionClasses}
      style={sectionHeight ? { height: sectionHeight } : undefined}
    >
      <div className="sticky overflow-hidden" style={{ top: stickyOffset }}>
        <motion.div ref={contentRef} style={{ x }} className={innerClasses}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
