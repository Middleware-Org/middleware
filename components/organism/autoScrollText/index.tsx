"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

type AutoScrollTextProps = {
  children: ReactNode;
  pause?: number;
  scrollDuration?: number;
  className?: string;
  once?: boolean;
};

const AutoScrollText: React.FC<AutoScrollTextProps> = ({
  children,
  pause = 2,
  scrollDuration = 8,
  className,
  once = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    const container = containerRef.current;
    const content = textRef.current;
    if (!container || !content) return;

    const distance = content.scrollWidth - container.clientWidth;

    if (distance <= 0) {
      controls.set({ x: 0 });
      return;
    }

    let isCancelled = false;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const runLoop = async () => {
      while (!isCancelled) {
        await controls.start({ x: 0, transition: { duration: 0 } });
        await delay(pause * 1000);
        if (isCancelled) break;

        await controls.start({
          x: -distance,
          transition: { duration: scrollDuration, ease: "linear" },
        });
        if (isCancelled) break;

        await delay(pause * 1000);
      }
    };

    const runOnce = async () => {
      await controls.start({ x: 0, transition: { duration: 0 } });
      await delay(pause * 1000);
      if (isCancelled) return;

      await controls.start({
        x: -distance,
        transition: { duration: scrollDuration, ease: "linear" },
      });
      if (isCancelled) return;

      await delay(pause * 1000);
      if (isCancelled) return;

      await controls.start({
        x: 0,
        transition: { duration: 0 },
      });
    };

    if (once) {
      runOnce();
    } else {
      runLoop();
    }

    return () => {
      isCancelled = true;
      controls.stop();
    };
  }, [children, pause, scrollDuration, once, controls]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <motion.div
        ref={textRef}
        animate={controls}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AutoScrollText;
