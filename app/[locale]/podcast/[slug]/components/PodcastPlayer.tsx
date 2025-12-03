"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useRef, useState, useCallback } from "react";
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
import { PodcastBookmark, podcastBookmarksStorage } from "@/lib/storage/podcastBookmarks";

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
  const [bookmarks, setBookmarks] = useState<PodcastBookmark[]>([]);

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

  // Load bookmarks
  useEffect(() => {
    async function loadBookmarks() {
      try {
        await podcastBookmarksStorage.init();
        const savedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastId);
        setBookmarks(savedBookmarks);
      } catch (error) {
        console.error("Errore nel caricamento dei segnaposto:", error);
      }
    }
    loadBookmarks();
  }, [podcastId]);

  // Funzione per aggiungere segnaposto al tempo corrente
  const handleToggleBookmark = useCallback(async () => {
    try {
      // Trova il segmento/chunk corrispondente al tempo corrente
      const currentSegment = segments.find((s) => currentTime >= s.start && currentTime <= s.end);

      if (!currentSegment) {
        // Se non c'è un segmento corrispondente, non aggiungere il segnaposto
        return;
      }

      // Controlla se esiste già un segnaposto nello stesso chunk/segmento
      const allBookmarks = await podcastBookmarksStorage.getBookmarks(podcastId);
      const existingBookmark = allBookmarks.find(
        (b) => b.time >= currentSegment.start && b.time <= currentSegment.end,
      );

      if (existingBookmark) {
        // Non aggiungere se esiste già un segnaposto nello stesso chunk
        return;
      }

      // Aggiungi un nuovo segnaposto solo se non esiste già nello stesso chunk
      const newBookmark = await podcastBookmarksStorage.saveBookmark({
        podcastSlug: podcastId,
        time: currentTime,
      });
      const updated = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);
      setBookmarks(updated);
      // Notifica il cambio ai componenti figli (come PodcastBookmarkManager)
      // Questo triggera onBookmarksChange in Transcript che ricarica i bookmarks
    } catch (error) {
      console.error("Errore nell'aggiunta del segnaposto:", error);
    }
  }, [podcastId, currentTime, bookmarks, segments]);

  // Verifica se c'è un segnaposto al tempo corrente
  const hasBookmarkAtCurrentTime = bookmarks.some((b) => Math.abs(b.time - currentTime) < 2);

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
          showSpeedControl={showSpeedControl}
          hasBookmarkAtCurrentTime={hasBookmarkAtCurrentTime}
          onPlay={play}
          onPause={pause}
          onForward={forward}
          onBackward={backward}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleVolumeControl={() => setShowVolumeControl(!showVolumeControl)}
          onToggleSpeedControl={() => setShowSpeedControl(!showSpeedControl)}
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
        podcastSlug={article.slug}
        onBookmarksChange={async () => {
          // Ricarica i bookmarks dal database quando cambiano
          const updatedBookmarks = await podcastBookmarksStorage.getBookmarks(podcastId);
          setBookmarks(updatedBookmarks);
          // Questo triggera il ricaricamento anche in PodcastBookmarkManager
        }}
      />
    </div>
  );
}
