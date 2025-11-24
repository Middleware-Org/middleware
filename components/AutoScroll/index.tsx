"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

type AutoScrollProps = {
  paramName: string;
  offset?: number;
};

export default function AutoScroll({ paramName, offset = 155 }: AutoScrollProps) {
  const searchParams = useSearchParams();
  const value = searchParams.get(paramName);

  useEffect(() => {
    if (value) {
      // Retrieve saved scroll position from sessionStorage
      const savedScrollY = sessionStorage.getItem("scrollPosition");
      const savedPosition = savedScrollY ? parseInt(savedScrollY, 10) : null;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const element = document.getElementById(value);
        if (element) {
          const elementPosition = element.offsetTop - offset; // Account for sticky header
          const currentScroll = window.scrollY;

          // If scroll was reset to 0 (or very close) and we have a saved position, restore it first
          if (currentScroll < 10 && savedPosition && savedPosition > 10) {
            // Restore scroll position immediately
            window.scrollTo({
              top: savedPosition,
              behavior: "auto",
            });

            // Clear saved position
            sessionStorage.removeItem("scrollPosition");

            // Then scroll to target after a brief moment
            requestAnimationFrame(() => {
              window.scrollTo({
                top: elementPosition,
                behavior: "smooth",
              });
            });
          } else {
            // Normal case: scroll from current position
            const distance = Math.abs(currentScroll - elementPosition);
            if (distance > 50) {
              window.scrollTo({
                top: elementPosition,
                behavior: "smooth",
              });
            }
            // Clear saved position if not needed
            if (savedPosition) {
              sessionStorage.removeItem("scrollPosition");
            }
          }
        }
      });
    }
  }, [value, offset]);

  return null;
}
