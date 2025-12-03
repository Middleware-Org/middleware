"use client";

/* **************************************************
 * Imports
 **************************************************/
import { SerifText } from "@/components/atoms/typography";
import { Segment } from "./types";
import styles from "./PodcastPlayerStyles";
import PodcastBookmarkManager from "./PodcastBookmarkManager";

/* **************************************************
 * Types
 **************************************************/
type TranscriptProps = {
  segments: Segment[];
  currentSegmentIndex: number;
  transcriptContainerRef: React.RefObject<HTMLDivElement | null>;
  transcriptContentInnerRef: React.RefObject<HTMLDivElement | null>;
  activeSegmentRef: React.RefObject<HTMLDivElement | null>;
  podcastSlug: string;
  onBookmarksChange?: (bookmarks: Array<{ time: number }>) => void;
};

/* **************************************************
 * Transcript
 **************************************************/
export default function Transcript({
  segments,
  currentSegmentIndex,
  transcriptContainerRef,
  transcriptContentInnerRef,
  activeSegmentRef,
  podcastSlug,
  onBookmarksChange,
}: TranscriptProps) {
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
            const isActive = index === currentSegmentIndex;
            const isPrevious = index === currentSegmentIndex - 1;
            const isNext = index === currentSegmentIndex + 1;

            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                className={styles.segmentWrapper}
                data-segment-index={index}
              >
                <SerifText
                  className={
                    isActive
                      ? styles.segmentActive
                      : isPrevious || isNext
                        ? styles.segmentFade
                        : styles.segment
                  }
                >
                  {segment.text}
                </SerifText>
              </div>
            );
          })}
          <PodcastBookmarkManager
            podcastSlug={podcastSlug}
            contentContainerSelector="#podcast-transcript-content"
            segments={segments.map((s) => ({ start: s.start, end: s.end }))}
            onBookmarksChange={onBookmarksChange}
          />
        </div>
      </div>
      <div className={styles.transcriptFadeBottom} />
    </div>
  );
}
