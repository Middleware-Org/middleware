"use client";

/* **************************************************
 * Imports
 **************************************************/
import { memo, useMemo } from "react";

import { SerifText } from "@/components/atoms/typography";

import PodcastBookmarkManager from "./PodcastBookmarkManager";
import styles from "./PodcastPlayerStyles";
import type { Segment } from "./types";

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
          {segments.map((segment, index) => {
            const visualState =
              index === currentSegmentIndex
                ? "active"
                : index === currentSegmentIndex - 1 || index === currentSegmentIndex + 1
                  ? "nearby"
                  : "default";

            return (
              <TranscriptSegmentRow
                key={segment.id}
                segment={segment}
                visualState={visualState}
                index={index}
                activeSegmentRef={activeSegmentRef}
              />
            );
          })}
          <PodcastBookmarkManager
            contentContainerSelector="#podcast-transcript-content"
            segments={bookmarkSegments}
            bookmarks={bookmarks}
            onRemoveBookmark={onRemoveBookmark}
          />
        </div>
      </div>
      <div className={styles.transcriptFadeBottom} />
    </div>
  );
}
