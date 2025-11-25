"use client";

/* **************************************************
 * Imports
 **************************************************/
import { SerifText } from "@/components/atoms/typography";
import { Segment } from "./types";
import styles from "./PodcastPlayerStyles";

/* **************************************************
 * Types
 **************************************************/
type TranscriptProps = {
  segments: Segment[];
  currentSegmentIndex: number;
  transcriptContainerRef: React.RefObject<HTMLDivElement | null>;
  transcriptContentInnerRef: React.RefObject<HTMLDivElement | null>;
  activeSegmentRef: React.RefObject<HTMLDivElement | null>;
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
}: TranscriptProps) {
  if (segments.length === 0) {
    return null;
  }

  return (
    <div className={styles.transcriptSection}>
      <div ref={transcriptContainerRef} className={styles.transcriptContent}>
        <div ref={transcriptContentInnerRef} className={styles.transcriptContentInner}>
          {segments.map((segment, index) => {
            const isActive = index === currentSegmentIndex;
            const isPrevious = index === currentSegmentIndex - 1;
            const isNext = index === currentSegmentIndex + 1;

            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                className={styles.segmentWrapper}
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
        </div>
      </div>
      <div className={styles.transcriptFadeBottom} />
    </div>
  );
}

