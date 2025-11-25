"use client";

/* **************************************************
 * Imports
 **************************************************/
import { MonoTextLight } from "@/components/atoms/typography";
import { formatTime } from "./utils/formatTime";
import styles from "./PodcastPlayerStyles";

/* **************************************************
 * Types
 **************************************************/
type ProgressBarProps = {
  currentTime: number;
  totalTime: number;
  currentPosition: number;
  totalPositions: number;
  onSeek: (position: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
};

/* **************************************************
 * ProgressBar
 **************************************************/
export default function ProgressBar({
  currentTime,
  totalTime,
  currentPosition,
  totalPositions,
  onSeek,
  onSeekStart,
  onSeekEnd,
}: ProgressBarProps) {
  const handleRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseFloat(e.target.value);
    onSeek(newPosition);
  };

  return (
    <div className={styles.progressContainer}>
      <MonoTextLight className={styles.time}>{formatTime(currentTime)}</MonoTextLight>
      <input
        type="range"
        min={0}
        max={Math.max(totalPositions - 1, 0)}
        step={1}
        value={currentPosition}
        onChange={handleRangeInput}
        onInput={handleRangeInput}
        onMouseDown={onSeekStart}
        onMouseUp={onSeekEnd}
        onTouchStart={onSeekStart}
        onTouchEnd={onSeekEnd}
        className={styles.progressBar}
        aria-label="Posizione nel podcast"
        style={{
          background: `linear-gradient(to right, var(--tertiary) 0%, var(--tertiary) ${totalPositions > 0 ? (currentPosition / Math.max(totalPositions - 1, 1)) * 100 : 0}%, var(--secondary) ${totalPositions > 0 ? (currentPosition / Math.max(totalPositions - 1, 1)) * 100 : 0}%, var(--secondary) 100%)`,
        }}
      />
      <MonoTextLight className={styles.time}>{formatTime(totalTime)}</MonoTextLight>
    </div>
  );
}

