"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useRef, useState } from "react";
import { Article } from "@/.velite";
import { getAuthorBySlug, getCategoryBySlug, getIssueBySlug } from "@/lib/content";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useTranscriptScroll } from "./hooks/useTranscriptScroll";
import PodcastHeader from "./PodcastHeader";
import ProgressBar from "./ProgressBar";
import PlayerControls from "./PlayerControls";
import Transcript from "./Transcript";
import { Segment } from "./types";
import styles from "./PodcastPlayerStyles";

/* **************************************************
 * Types
 **************************************************/
type PodcastPlayerProps = {
  article: Article;
};

/* **************************************************
 * PodcastPlayer
 **************************************************/
export default function PodcastPlayer({ article }: PodcastPlayerProps) {
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const transcriptContentInnerRef = useRef<HTMLDivElement | null>(null);
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);
  const [showVolumeControl, setShowVolumeControl] = useState<boolean>(false);
  const [showSpeedControl, setShowSpeedControl] = useState<boolean>(false);

  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);
  const issue = getIssueBySlug(article.issue);

  const podcastId = article.slug;
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
    audioSrc: article.audio || "",
    podcastId,
    totalPositions,
    onTimeUpdate: (newTime) => {
      // Find current segment
      if (segments.length > 0) {
        const segmentIndex = segments.findIndex((s) => newTime >= s.start && newTime <= s.end);
        if (segmentIndex !== -1 && segmentIndex !== currentSegmentIndex) {
          setCurrentSegmentIndex(segmentIndex);
        }
      }
    },
  });

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
    if (article.audio_chunks) {
      fetch(article.audio_chunks)
        .then((res) => res.json())
        .then((data: Segment[]) => {
          setSegments(data);
        })
        .catch((err) => {
          console.error("Failed to load audio segments:", err);
        });
    }
  }, [article.audio_chunks]);

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

  if (!article.audio) {
    return null;
  }

  return (
    <div className={styles.container}>
      <audio ref={audioRef} src={article.audio} preload="metadata" />

      {/* Top Grid: Header + Player */}
      <div className={styles.topGrid}>
        <PodcastHeader article={article} issue={issue} author={author} category={category} />

        <ProgressBar
          currentTime={currentTime}
          totalTime={totalTime}
          currentPosition={currentPosition}
          totalPositions={audioTotalPositions}
          onSeek={seek}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
        />

        <PlayerControls
          isPlaying={isPlaying}
          volume={volume}
          playbackRate={playbackRate}
          showVolumeControl={showVolumeControl}
          showSpeedControl={showSpeedControl}
          onPlay={play}
          onPause={pause}
          onForward={forward}
          onBackward={backward}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleVolumeControl={() => setShowVolumeControl(!showVolumeControl)}
          onToggleSpeedControl={() => setShowSpeedControl(!showSpeedControl)}
        />
      </div>

      {/* Bottom Grid: Transcript */}
      <Transcript
        segments={segments}
        currentSegmentIndex={currentSegmentIndex}
        transcriptContainerRef={transcriptContainerRef}
        transcriptContentInnerRef={transcriptContentInnerRef}
        activeSegmentRef={activeSegmentRef}
      />
    </div>
  );
}
