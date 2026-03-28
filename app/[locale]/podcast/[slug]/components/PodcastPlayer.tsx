"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

import { toast } from "@/hooks/use-toast";
import { getGitHubMediaUrl } from "@/lib/github/images";

import type { Podcast } from "@/.velite";

import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { usePodcastBookmarks } from "./hooks/usePodcastBookmarks";
import { useTranscriptScroll } from "./hooks/useTranscriptScroll";
import PlayerControls from "./PlayerControls";
import styles from "./PodcastPlayerStyles";
import ProgressBar from "./ProgressBar";
import type { Segment } from "./types";

const Transcript = dynamic(() => import("./Transcript"));

function findSegmentIndexAtTime(segments: Segment[], currentTime: number) {
  let left = 0;
  let right = segments.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const segment = segments[middle];

    if (currentTime < segment.start) {
      right = middle - 1;
      continue;
    }

    if (currentTime > segment.end) {
      left = middle + 1;
      continue;
    }

    return middle;
  }

  return -1;
}

/* **************************************************
 * Types
 **************************************************/
type PodcastPlayerProps = {
  podcast: Pick<Podcast, "slug" | "audio" | "audio_chunks">;
};

/* **************************************************
 * PodcastPlayer
 **************************************************/
export default function PodcastPlayer({ podcast }: PodcastPlayerProps) {
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const transcriptContentInnerRef = useRef<HTMLDivElement | null>(null);
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [showVolumeControl, setShowVolumeControl] = useState<boolean>(false);

  const podcastId = podcast.slug;
  const totalPositions = 1000;

  // Audio player hook
  const {
    audioRef,
    isPlaying,
    currentTime,
    totalTime,
    currentPosition,
    totalPositions: audioTotalPositions,
    wasPlayingBeforeSeek,
    setWasPlayingBeforeSeek,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    play,
    pause,
    forward,
    backward,
    seek,
  } = useAudioPlayer({
    audioSrc: podcast.audio ? getGitHubMediaUrl(podcast.audio) : "",
    podcastId,
    totalPositions,
  });

  const currentSegmentIndex = findSegmentIndexAtTime(segments, currentTime);

  // Transcript scroll hook
  useTranscriptScroll({
    segments,
    currentSegmentIndex,
    currentTime,
    activeSegmentRef,
    transcriptContainerRef,
    transcriptContentInnerRef,
  });

  // Load segments JSON
  useEffect(() => {
    if (podcast.audio_chunks) {
      const chunksUrl = getGitHubMediaUrl(podcast.audio_chunks);
      fetch(chunksUrl)
        .then((res) => res.json())
        .then((data: Segment[]) => {
          setSegments(data);
        })
        .catch((err) => {
          toast.error(
            "Impossibile caricare i segmenti audio",
            err instanceof Error ? err.message : undefined,
          );
        });
    }
  }, [podcast.audio_chunks]);

  // Usa il custom hook per gestire i bookmarks
  const { bookmarks, addBookmark, removeBookmark, getBookmarkInChunk, hasBookmarkInChunk } =
    usePodcastBookmarks({
      podcastSlug: podcastId,
      segments,
    });

  // Funzione per aggiungere segnaposto al tempo corrente
  const handleToggleBookmark = useCallback(async () => {
    const existingBookmark = getBookmarkInChunk(currentTime);

    if (existingBookmark) {
      await removeBookmark(existingBookmark.id);
      return;
    }

    await addBookmark(currentTime);
  }, [currentTime, getBookmarkInChunk, removeBookmark, addBookmark]);

  // Verifica se c'è un segnaposto nel chunk corrente (usando logica unificata)
  const hasBookmarkAtCurrentTime = hasBookmarkInChunk(currentTime);

  // Handlers
  const handleSeekStart = () => {
    setWasPlayingBeforeSeek(isPlaying);
    if (isPlaying) {
      pause();
    }
  };

  const handleSeekEnd = () => {
    if (wasPlayingBeforeSeek) {
      play();
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const handlePlaybackRateChange = (value: number) => {
    setPlaybackRate(value);
  };

  if (!podcast.audio) {
    return null;
  }

  const audioUrl = podcast.audio ? getGitHubMediaUrl(podcast.audio) : "";

  return (
    <div className={styles.container}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Top Grid: Player */}
      <div className={styles.topGrid}>
        <ProgressBar
          currentTime={currentTime}
          totalTime={totalTime}
          currentPosition={currentPosition}
          totalPositions={audioTotalPositions}
          bookmarks={bookmarks}
          onSeek={seek}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
        />

        <PlayerControls
          isPlaying={isPlaying}
          volume={volume}
          playbackRate={playbackRate}
          showVolumeControl={showVolumeControl}
          hasBookmarkAtCurrentTime={hasBookmarkAtCurrentTime}
          onPlay={play}
          onPause={pause}
          onForward={forward}
          onBackward={backward}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleVolumeControl={() => setShowVolumeControl(!showVolumeControl)}
          onToggleBookmark={handleToggleBookmark}
        />
      </div>

      {/* Bottom Grid: Transcript */}
      <Transcript
        segments={segments}
        currentSegmentIndex={currentSegmentIndex}
        transcriptContainerRef={transcriptContainerRef}
        transcriptContentInnerRef={transcriptContentInnerRef}
        activeSegmentRef={activeSegmentRef}
        bookmarks={bookmarks}
        onRemoveBookmark={removeBookmark}
      />
    </div>
  );
}
