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
  bookmarks?: Array<{ time: number }>; // Array di segnaposto con i loro tempi
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
  bookmarks = [],
  onSeek,
  onSeekStart,
  onSeekEnd,
}: ProgressBarProps) {
  const handleRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseFloat(e.target.value);
    onSeek(newPosition);
  };

  // Calcola le posizioni delle tacchette dei segnaposto
  const bookmarkPositions = bookmarks.map((bookmark) => {
    if (totalTime === 0) return 0;
    const percentage = (bookmark.time / totalTime) * 100;
    return Math.min(100, Math.max(0, percentage));
  });

  // Crea il background con le tacchette
  const bookmarkMarkers = bookmarkPositions
    .map((pos) => `${pos}%`)
    .join(", ");
  
  const backgroundStyle = totalPositions > 0
    ? `linear-gradient(to right, var(--tertiary) 0%, var(--tertiary) ${(currentPosition / Math.max(totalPositions - 1, 1)) * 100}%, var(--secondary) ${(currentPosition / Math.max(totalPositions - 1, 1)) * 100}%, var(--secondary) 100%)`
    : `linear-gradient(to right, var(--secondary) 0%, var(--secondary) 100%)`;

  return (
    <div className={styles.progressContainer}>
      <MonoTextLight className={styles.time}>{formatTime(currentTime)}</MonoTextLight>
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
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
            background: backgroundStyle,
            width: "100%",
          }}
        />
        {/* Tacchette dei segnaposto */}
        {bookmarkPositions.map((position, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${position}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "2px",
              height: "12px",
              backgroundColor: "var(--tertiary)",
              pointerEvents: "none",
              zIndex: 10,
            }}
            aria-label={`Segnaposto a ${formatTime(bookmarks[index]?.time || 0)}`}
          />
        ))}
      </div>
      <MonoTextLight className={styles.time}>{formatTime(totalTime)}</MonoTextLight>
    </div>
  );
}

