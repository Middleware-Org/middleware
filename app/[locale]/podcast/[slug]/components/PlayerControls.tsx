"use client";

/* **************************************************
 * Imports
 **************************************************/
import {
  Rewind,
  FastForward,
  Pause,
  Play,
  Volume2,
  Zap,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
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
  showSpeedControl: boolean;
  hasBookmarkAtCurrentTime: boolean;
  onPlay: () => void;
  onPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onVolumeChange: (value: number) => void;
  onPlaybackRateChange: (value: number) => void;
  onToggleVolumeControl: () => void;
  onToggleSpeedControl: () => void;
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
  showSpeedControl,
  hasBookmarkAtCurrentTime,
  onPlay,
  onPause,
  onForward,
  onBackward,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleVolumeControl,
  onToggleSpeedControl,
  onToggleBookmark,
}: PlayerControlsProps) {
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const speedControlRef = useRef<HTMLDivElement>(null);
  const volumeButtonWrapperRef = useRef<HTMLDivElement>(null);
  const speedButtonWrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside({
    isOpen: showVolumeControl,
    refs: [volumeControlRef, volumeButtonWrapperRef],
    onClose: onToggleVolumeControl,
  });

  useClickOutside({
    isOpen: showSpeedControl,
    refs: [speedControlRef, speedButtonWrapperRef],
    onClose: onToggleSpeedControl,
  });

  return (
    <div className={styles.playerSection}>
      <div className={styles.buttons}>
        <div className={styles.buttonGroup}>
          <div ref={volumeButtonWrapperRef} className={styles.volumeButtonWrapper}>
            {/* <Button
              variants="unstyled"
              onClick={onToggleVolumeControl}
              className={styles.controlButton}
              aria-label="Volume"
            >
              <Volume2 className={styles.icon} />
            </Button> */}
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
          <div ref={speedButtonWrapperRef} className={styles.speedButtonWrapper}>
            <Button
              variants="unstyled"
              onClick={onToggleSpeedControl}
              className={styles.controlButton}
              aria-label="Velocità di riproduzione"
            >
              <Zap className={styles.icon} />
            </Button>
            {showSpeedControl && (
              <div ref={speedControlRef} className={styles.speedControlContainer}>
                <VerticalRange
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={playbackRate}
                  onChange={onPlaybackRateChange}
                  formatValue={(val) => `${val.toFixed(1)}x`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
