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
  useEffect(() => {
    if (
      activeSegmentRef.current &&
      transcriptContainerRef.current &&
      transcriptContentInnerRef.current &&
      currentSegmentIndex >= 0 &&
      segments.length > 0
    ) {
      const container = transcriptContainerRef.current;
      const innerContent = transcriptContentInnerRef.current;
      const activeElement = activeSegmentRef.current;

      // Get dimensions
      const elementOffsetTop = activeElement.offsetTop;
      const elementHeight = activeElement.offsetHeight;
      const containerHeight = container.clientHeight;
      const targetOffset = 80; // Preferred offset from top
      const availableHeight = containerHeight - targetOffset - 20; // 20px padding at bottom

      // Get current segment
      const currentSegment = segments[currentSegmentIndex];
      const segmentDuration = currentSegment.end - currentSegment.start;
      const timeInSegment = currentTime - currentSegment.start;
      let segmentProgress = Math.max(0, Math.min(1, timeInSegment / segmentDuration));

      // Accelerate scroll by 30% to keep text ahead of audio
      segmentProgress = Math.min(1, segmentProgress * 1.3);

      let translateY: number;

      if (elementHeight <= availableHeight) {
        // Segment fits: position it at targetOffset from top
        translateY = targetOffset - elementOffsetTop;
      } else {
        // Segment is too long: scroll progressively based on audio progress
        const totalScrollableHeight = elementHeight - availableHeight;
        const scrollOffset = segmentProgress * totalScrollableHeight;
        const baseTranslateY = targetOffset - elementOffsetTop;
        translateY = baseTranslateY - scrollOffset;
      }

      // Apply transform to move the content
      innerContent.style.transform = `translateY(${translateY}px)`;
    }
  }, [currentSegmentIndex, currentTime, segments, activeSegmentRef, transcriptContainerRef, transcriptContentInnerRef]);
}

