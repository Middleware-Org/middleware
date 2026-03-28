/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useRef } from "react";

/* **************************************************
 * Types
 **************************************************/
type Segment = {
  id: number;
  text: string;
  start: number;
  end: number;
};

type UseTranscriptScrollProps = {
  segments: Segment[];
  currentSegmentIndex: number;
  currentTime: number;
  activeSegmentRef: React.RefObject<HTMLDivElement | null>;
  transcriptContainerRef: React.RefObject<HTMLDivElement | null>;
  transcriptContentInnerRef: React.RefObject<HTMLDivElement | null>;
};

/* **************************************************
 * useTranscriptScroll Hook
 * Gestisce l'auto-scroll del transcript
 **************************************************/
export function useTranscriptScroll({
  segments,
  currentSegmentIndex,
  currentTime,
  activeSegmentRef,
  transcriptContainerRef,
  transcriptContentInnerRef,
}: UseTranscriptScrollProps) {
  const layoutMetricsRef = useRef<{
    elementOffsetTop: number;
    elementHeight: number;
    containerHeight: number;
    segmentStart: number;
    segmentEnd: number;
  } | null>(null);
  const lastTranslateYRef = useRef<number | null>(null);
  const frameRequestRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      !activeSegmentRef.current ||
      !transcriptContainerRef.current ||
      currentSegmentIndex < 0 ||
      segments.length === 0
    ) {
      layoutMetricsRef.current = null;
      return;
    }

    const activeElement = activeSegmentRef.current;
    const container = transcriptContainerRef.current;
    const currentSegment = segments[currentSegmentIndex];

    layoutMetricsRef.current = {
      elementOffsetTop: activeElement.offsetTop,
      elementHeight: activeElement.offsetHeight,
      containerHeight: container.clientHeight,
      segmentStart: currentSegment.start,
      segmentEnd: currentSegment.end,
    };

    lastTranslateYRef.current = null;
  }, [currentSegmentIndex, segments, activeSegmentRef, transcriptContainerRef]);

  useEffect(() => {
    if (!transcriptContentInnerRef.current || currentSegmentIndex < 0) {
      return;
    }

    const metrics = layoutMetricsRef.current;
    if (!metrics) {
      return;
    }

    const targetOffset = 80;
    const availableHeight = metrics.containerHeight - targetOffset - 20;
    const segmentDuration = metrics.segmentEnd - metrics.segmentStart;
    const safeDuration = segmentDuration > 0 ? segmentDuration : 1;
    const timeInSegment = currentTime - metrics.segmentStart;
    let segmentProgress = Math.max(0, Math.min(1, timeInSegment / safeDuration));

    segmentProgress = Math.min(1, segmentProgress * 1.3);

    let translateY: number;

    if (metrics.elementHeight <= availableHeight) {
      translateY = targetOffset - metrics.elementOffsetTop;
    } else {
      const totalScrollableHeight = metrics.elementHeight - availableHeight;
      const scrollOffset = segmentProgress * totalScrollableHeight;
      const baseTranslateY = targetOffset - metrics.elementOffsetTop;
      translateY = baseTranslateY - scrollOffset;
    }

    const lastTranslateY = lastTranslateYRef.current;
    if (lastTranslateY !== null && Math.abs(lastTranslateY - translateY) < 0.75) {
      return;
    }

    if (frameRequestRef.current !== null) {
      cancelAnimationFrame(frameRequestRef.current);
    }

    frameRequestRef.current = requestAnimationFrame(() => {
      lastTranslateYRef.current = translateY;
      if (transcriptContentInnerRef.current) {
        transcriptContentInnerRef.current.style.transform = `translateY(${translateY}px)`;
      }
    });

    return () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [currentSegmentIndex, currentTime, transcriptContentInnerRef]);
}
