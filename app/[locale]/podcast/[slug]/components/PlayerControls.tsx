"use client";

/* **************************************************
 * Imports
 **************************************************/
import { Rewind, FastForward, Pause, Play, Bookmark, BookmarkCheck } from "lucide-react";
import Button from "@/components/atoms/button";
import VerticalRange from "./VerticalRange";
import styles from "./PodcastPlayerStyles";
import { useClickOutside } from "./hooks/useClickOutside";
import { useRef } from "react";

/* **************************************************
 * Types
 **************************************************/
type PlayerControlsProps = {
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  showVolumeControl: boolean;
  hasBookmarkAtCurrentTime: boolean;
  onPlay: () => void;
  onPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onVolumeChange: (value: number) => void;
  onPlaybackRateChange: (value: number) => void;
  onToggleVolumeControl: () => void;
  onToggleBookmark: () => void;
};

/* **************************************************
 * PlayerControls
 **************************************************/
export default function PlayerControls({
  isPlaying,
  volume,
  playbackRate,
  showVolumeControl,
  hasBookmarkAtCurrentTime,
  onPlay,
  onPause,
  onForward,
  onBackward,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleVolumeControl,
  onToggleBookmark,
}: PlayerControlsProps) {
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const volumeButtonWrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside({
    isOpen: showVolumeControl,
    refs: [volumeControlRef, volumeButtonWrapperRef],
    onClose: onToggleVolumeControl,
  });

  // Cycle through playback speeds: 1x -> 1.5x -> 2.0x -> 0.5x -> 1.0x
  const handleSpeedCycle = () => {
    const speeds = [1.0, 1.5, 2.0, 0.5];
    const currentIndex = speeds.findIndex((speed) => Math.abs(speed - playbackRate) < 0.1);
    // If current speed is not in the list, start from 1.0x
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % speeds.length;
    onPlaybackRateChange(speeds[nextIndex]);
  };

  return (
    <div className={styles.playerSection}>
      <div className={styles.buttons}>
        <div className={styles.buttonGroup}>
          <div ref={volumeButtonWrapperRef} className={styles.volumeButtonWrapper}>
            <Button
              variants="unstyled"
              onClick={onToggleBookmark}
              className={styles.controlButton}
              aria-label={hasBookmarkAtCurrentTime ? "Rimuovi segnaposto" : "Aggiungi segnaposto"}
              title={hasBookmarkAtCurrentTime ? "Rimuovi segnaposto" : "Aggiungi segnaposto"}
            >
              {hasBookmarkAtCurrentTime ? (
                <BookmarkCheck className={styles.icon} />
              ) : (
                <Bookmark className={styles.icon} />
              )}
            </Button>
            {showVolumeControl && (
              <div ref={volumeControlRef} className={styles.volumeControlContainer}>
                <VerticalRange
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={onVolumeChange}
                  formatValue={(val) => `${Math.round(val)}%`}
                />
              </div>
            )}
          </div>
          <Button
            variants="unstyled"
            onClick={onBackward}
            className={styles.controlButton}
            aria-label="Indietro di 10 secondi"
          >
            <Rewind className={styles.icon} />
          </Button>
        </div>

        <Button
          variants="unstyled"
          onClick={isPlaying ? onPause : onPlay}
          className={styles.playButton}
          aria-label={isPlaying ? "Pausa" : "Riproduci"}
        >
          {isPlaying ? <Pause className={styles.playIcon} /> : <Play className={styles.playIcon} />}
        </Button>

        <div className={styles.buttonGroup}>
          <Button
            variants="unstyled"
            onClick={onForward}
            className={styles.controlButton}
            aria-label="Avanti di 10 secondi"
          >
            <FastForward className={styles.icon} />
          </Button>
          <Button
            variants="unstyled"
            onClick={handleSpeedCycle}
            className={styles.controlButton}
            aria-label={`Velocità di riproduzione: ${playbackRate.toFixed(1)}x`}
            title={`Velocità: ${playbackRate.toFixed(1)}x`}
          >
            <span className={styles.speedText}>{playbackRate.toFixed(1)}x</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
