"use client";

/* **************************************************
 * Imports
 **************************************************/
import { memo, useMemo } from "react";
import dynamic from "next/dynamic";

import { SerifText } from "@/components/atoms/typography";

import styles from "./PodcastPlayerStyles";
import type { Segment } from "./types";

const PodcastBookmarkManager = dynamic(() => import("./PodcastBookmarkManager"), {
  ssr: false,
});

/* **************************************************
 * Types
 **************************************************/
type TranscriptProps = {
  segments: Segment[];
  currentSegmentIndex: number;
  transcriptContainerRef: React.RefObject<HTMLDivElement | null>;
  transcriptContentInnerRef: React.RefObject<HTMLDivElement | null>;
  activeSegmentRef: React.RefObject<HTMLDivElement | null>;
  bookmarks: Array<{ id: string; time: number }>;
  onRemoveBookmark: (id: string) => Promise<void>;
};

const VIRTUAL_WINDOW_SIZE = 180;
const VIRTUAL_OVERSCAN = 60;

type TranscriptSegmentRowProps = {
  segment: Segment;
  visualState: "active" | "nearby" | "default";
  index: number;
  activeSegmentRef: React.RefObject<HTMLDivElement | null>;
};

const TranscriptSegmentRow = memo(function TranscriptSegmentRow({
  segment,
  visualState,
  index,
  activeSegmentRef,
}: TranscriptSegmentRowProps) {
  return (
    <div
      ref={visualState === "active" ? activeSegmentRef : null}
      className={styles.segmentWrapper}
      data-segment-index={index}
    >
      <SerifText
        className={
          visualState === "active"
            ? styles.segmentActive
            : visualState === "nearby"
              ? styles.segmentFade
              : styles.segment
        }
      >
        {segment.text}
      </SerifText>
    </div>
  );
}, areTranscriptSegmentRowPropsEqual);

function areTranscriptSegmentRowPropsEqual(
  previous: TranscriptSegmentRowProps,
  next: TranscriptSegmentRowProps,
) {
  return (
    previous.segment === next.segment &&
    previous.visualState === next.visualState &&
    previous.index === next.index
  );
}

/* **************************************************
 * Transcript
 **************************************************/
export default function Transcript({
  segments,
  currentSegmentIndex,
  transcriptContainerRef,
  transcriptContentInnerRef,
  activeSegmentRef,
  bookmarks,
  onRemoveBookmark,
}: TranscriptProps) {
  const virtualRange = useMemo(() => {
    const totalSegments = segments.length;
    if (totalSegments === 0) {
      return { start: 0, end: 0 };
    }

    if (currentSegmentIndex < 0) {
      return {
        start: 0,
        end: Math.min(totalSegments, VIRTUAL_WINDOW_SIZE),
      };
    }

    const baseWindowStart = Math.max(0, currentSegmentIndex - Math.floor(VIRTUAL_WINDOW_SIZE / 2));
    const baseWindowEnd = Math.min(totalSegments, baseWindowStart + VIRTUAL_WINDOW_SIZE);
    const start = Math.max(0, baseWindowStart - VIRTUAL_OVERSCAN);
    const end = Math.min(totalSegments, baseWindowEnd + VIRTUAL_OVERSCAN);

    return { start, end };
  }, [currentSegmentIndex, segments.length]);

  const visibleSegments = useMemo(() => {
    return segments.slice(virtualRange.start, virtualRange.end);
  }, [segments, virtualRange.end, virtualRange.start]);

  const bookmarkSegments = useMemo(
    () => segments.map((segment) => ({ start: segment.start, end: segment.end })),
    [segments],
  );

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className={styles.transcriptSection}>
      <div ref={transcriptContainerRef} className={styles.transcriptContent}>
        <div
          ref={transcriptContentInnerRef}
          id="podcast-transcript-content"
          className={styles.transcriptContentInner}
          style={{ position: "relative" }}
        >
          {visibleSegments.map((segment, index) => {
            const actualIndex = virtualRange.start + index;
            const visualState =
              actualIndex === currentSegmentIndex
                ? "active"
                : actualIndex === currentSegmentIndex - 1 || actualIndex === currentSegmentIndex + 1
                  ? "nearby"
                  : "default";

            return (
              <TranscriptSegmentRow
                key={segment.id}
                segment={segment}
                visualState={visualState}
                index={actualIndex}
                activeSegmentRef={activeSegmentRef}
              />
            );
          })}
          {bookmarks.length > 0 && (
            <PodcastBookmarkManager
              contentContainerSelector="#podcast-transcript-content"
              segments={bookmarkSegments}
              bookmarks={bookmarks}
              onRemoveBookmark={onRemoveBookmark}
            />
          )}
        </div>
      </div>
      <div className={styles.transcriptFadeBottom} />
    </div>
  );
}
