"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useCallback, useEffect, useRef, useState } from "react";
import { Rewind, FastForward, Pause, Play, Volume2, Zap } from "lucide-react";
import Image from "next/image";
import Button from "@/components/atoms/button";
import { MonoTextLight, SerifText } from "@/components/atoms/typography";
import { Article } from "@/.velite";
import { getAuthorBySlug, getCategoryBySlug, getIssueBySlug } from "@/lib/content";
import { formatDateByLang } from "@/lib/utils/date";
import { useParams } from "next/navigation";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { podcastProgressStorage } from "@/lib/storage/podcastProgress";
import VerticalRange from "./VerticalRange";
import styles from "./PodcastPlayerStyles";
import Link from "next/link";

/* **************************************************
 * Types
 **************************************************/
type Segment = {
  id: number;
  text: string;
  start: number;
  end: number;
};

type PodcastPlayerProps = {
  article: Article;
};

/* **************************************************
 * PodcastPlayer
 **************************************************/
export default function PodcastPlayer({ article }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const transcriptContentInnerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const speedControlRef = useRef<HTMLDivElement>(null);
  const volumeButtonWrapperRef = useRef<HTMLDivElement>(null);
  const speedButtonWrapperRef = useRef<HTMLDivElement>(null);
  const { lang = "it" } = useParams() as { lang: "it" };
  const isMobile = useIsMobile();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [totalPositions] = useState<number>(1000);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState<boolean>(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);
  const [volume, setVolume] = useState<number>(100);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showVolumeControl, setShowVolumeControl] = useState<boolean>(false);
  const [showSpeedControl, setShowSpeedControl] = useState<boolean>(false);
  const progressRestoredRef = useRef<boolean>(false);

  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);
  const issue = getIssueBySlug(article.issue);

  // Podcast ID per lo storage
  const podcastId = article.slug;

  // Auto-scroll to active segment using transform with progressive scrolling for long segments
  useEffect(() => {
    if (
      activeSegmentRef.current &&
      transcriptContainerRef.current &&
      transcriptContentInnerRef.current &&
      currentSegmentIndex >= 0 &&
      segments.length > 0
    ) {
      const container = transcriptContainerRef.current;
      const innerContent = transcriptContentInnerRef.current;
      const activeElement = activeSegmentRef.current;

      // Get dimensions
      const elementOffsetTop = activeElement.offsetTop;
      const elementHeight = activeElement.offsetHeight;
      const containerHeight = container.clientHeight;
      const targetOffset = 80; // Preferred offset from top
      const availableHeight = containerHeight - targetOffset - 20; // 20px padding at bottom

      // Get current segment
      const currentSegment = segments[currentSegmentIndex];
      const segmentDuration = currentSegment.end - currentSegment.start;
      const timeInSegment = currentTime - currentSegment.start;
      let segmentProgress = Math.max(0, Math.min(1, timeInSegment / segmentDuration));

      // Accelerate scroll by 30% to keep text ahead of audio
      // This ensures the text is always visible when being spoken
      segmentProgress = Math.min(1, segmentProgress * 1.3);

      let translateY: number;

      if (elementHeight <= availableHeight) {
        // Segment fits: position it at targetOffset from top
        translateY = targetOffset - elementOffsetTop;
      } else {
        // Segment is too long: scroll progressively based on audio progress
        // Calculate how much we need to scroll to show the relevant part
        const totalScrollableHeight = elementHeight - availableHeight;
        // Scroll from top (0) to bottom (totalScrollableHeight) based on accelerated segment progress
        const scrollOffset = segmentProgress * totalScrollableHeight;
        // Base position: align top of element to targetOffset
        const baseTranslateY = targetOffset - elementOffsetTop;
        // Add progressive scroll offset
        translateY = baseTranslateY - scrollOffset;
      }

      // Apply transform to move the content
      innerContent.style.transform = `translateY(${translateY}px)`;
    }
  }, [currentSegmentIndex, currentTime, segments]);

  // Close controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Check if click is outside volume control
      if (
        showVolumeControl &&
        volumeControlRef.current &&
        volumeButtonWrapperRef.current &&
        !volumeControlRef.current.contains(target) &&
        !volumeButtonWrapperRef.current.contains(target)
      ) {
        setShowVolumeControl(false);
      }

      // Check if click is outside speed control
      if (
        showSpeedControl &&
        speedControlRef.current &&
        speedButtonWrapperRef.current &&
        !speedControlRef.current.contains(target) &&
        !speedButtonWrapperRef.current.contains(target)
      ) {
        setShowSpeedControl(false);
      }
    };

    if (showVolumeControl || showSpeedControl) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showVolumeControl, showSpeedControl]);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        await podcastProgressStorage.init();
      } catch (error) {
        console.error("Errore nell'inizializzazione dello storage:", error);
      }
    };

    initStorage();
  }, []);

  // Start auto-save when audio is ready and playing
  useEffect(() => {
    if (totalTime === 0) {
      return;
    }

    // Use refs to get current values in real-time
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    podcastProgressStorage.startAutoSave(
      podcastId,
      () => {
        // Get current time directly from audio element for accuracy
        return audio.currentTime;
      },
      () => {
        // Get total time directly from audio element for accuracy
        return audio.duration || totalTime;
      },
    );

    return () => {
      podcastProgressStorage.stopAutoSave();
    };
  }, [podcastId, totalTime, isPlaying]);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const newTime = audio.currentTime;
      setCurrentTime(newTime);

      if (audio.duration > 0) {
        const newPosition = Math.floor((newTime / audio.duration) * totalPositions);
        setCurrentPosition(newPosition);
      }

      // Find current segment
      if (segments.length > 0) {
        const segmentIndex = segments.findIndex((s) => newTime >= s.start && newTime <= s.end);
        if (segmentIndex !== -1 && segmentIndex !== currentSegmentIndex) {
          setCurrentSegmentIndex(segmentIndex);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setTotalTime(audio.duration);
    };

    const handleCanPlay = async () => {
      if (audio.duration > 0 && totalTime === 0) {
        setTotalTime(audio.duration);

        // Ripristina la posizione salvata quando l'audio è pronto (solo una volta)
        if (!progressRestoredRef.current) {
          progressRestoredRef.current = true;
          const savedProgress = await podcastProgressStorage.getProgress(podcastId);
          if (
            savedProgress &&
            !savedProgress.isCompleted &&
            savedProgress.currentTime > 0 &&
            savedProgress.totalTime === audio.duration
          ) {
            audio.currentTime = savedProgress.currentTime;
            setCurrentTime(savedProgress.currentTime);
            setCurrentPosition(
              Math.floor((savedProgress.currentTime / audio.duration) * totalPositions),
            );
          }
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = async () => {
      setIsPlaying(false);
      // Save progress when pausing
      const audio = audioRef.current;
      if (audio && audio.duration > 0) {
        const progressPercentage = (audio.currentTime / audio.duration) * 100;
        await podcastProgressStorage.saveImmediately(
          podcastId,
          audio.currentTime,
          audio.duration,
          progressPercentage,
        );
      }
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentPosition(0);

      // Stop auto-save
      podcastProgressStorage.stopAutoSave();

      // Reset progress to 0 when audio ends
      if (totalTime > 0) {
        await podcastProgressStorage.saveProgress(podcastId, 0, totalTime, 0, false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [totalTime, totalPositions, segments, currentSegmentIndex, podcastId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && article.audio) {
      audio.load();
      audio.volume = volume / 100;
      audio.playbackRate = playbackRate;

      const checkDuration = () => {
        if (audio.duration && audio.duration > 0) {
          setTotalTime(audio.duration);
        } else {
          setTimeout(checkDuration, 100);
        }
      };

      setTimeout(checkDuration, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.audio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const wasPlaying = !audio.paused;
      audio.playbackRate = playbackRate;
      // Se stava riproducendo, continua a riprodurre dopo il cambio di velocità
      if (wasPlaying) {
        audio.play().catch((error) => {
          console.error("Error playing audio after rate change:", error);
        });
      }
    }
  }, [playbackRate]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play();
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  const forward = useCallback(async () => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.min(audio.currentTime + 10, audio.duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setCurrentPosition(Math.floor((newTime / audio.duration) * totalPositions));

      // Salva immediatamente quando si salta avanti
      if (audio.duration > 0) {
        const progressPercentage = (newTime / audio.duration) * 100;
        await podcastProgressStorage.saveImmediately(
          podcastId,
          newTime,
          audio.duration,
          progressPercentage,
        );
      }
    }
  }, [totalPositions, podcastId]);

  const backward = useCallback(async () => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(audio.currentTime - 10, 0);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
      setCurrentPosition(Math.floor((newTime / audio.duration) * totalPositions));

      // Salva immediatamente quando si salta indietro
      if (audio.duration > 0) {
        const progressPercentage = (newTime / audio.duration) * 100;
        await podcastProgressStorage.saveImmediately(
          podcastId,
          newTime,
          audio.duration,
          progressPercentage,
        );
      }
    }
  }, [totalPositions, podcastId]);

  const handleRangeInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (audio) {
        const newPosition = parseFloat(e.target.value);
        const newTime = (newPosition / totalPositions) * audio.duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        setCurrentPosition(newPosition);

        // Salva immediatamente quando cambia la timeline manualmente
        if (audio.duration > 0) {
          const progressPercentage = (newTime / audio.duration) * 100;
          await podcastProgressStorage.saveImmediately(
            podcastId,
            newTime,
            audio.duration,
            progressPercentage,
          );
        }
      }
    },
    [totalPositions, podcastId],
  );

  const handleMouseDown = useCallback(() => {
    setWasPlayingBeforeSeek(isPlaying);
    if (isPlaying) {
      pause();
    }
  }, [isPlaying, pause]);

  const handleMouseUp = useCallback(() => {
    if (wasPlayingBeforeSeek) {
      play();
    }
  }, [wasPlayingBeforeSeek, play]);

  const handleTouchStart = useCallback(() => {
    setWasPlayingBeforeSeek(isPlaying);
    if (isPlaying) {
      pause();
    }
  }, [isPlaying, pause]);

  const handleTouchEnd = useCallback(() => {
    if (wasPlayingBeforeSeek) {
      play();
    }
  }, [wasPlayingBeforeSeek, play]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
  }, []);

  const handlePlaybackRateChange = useCallback((value: number) => {
    setPlaybackRate(value);
  }, []);

  if (!article.audio) {
    return null;
  }

  return (
    <div className={styles.container}>
      <audio ref={audioRef} src={article.audio} preload="metadata" />

      {/* Top Grid: Header + Player */}
      <div className={styles.topGrid}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          {issue?.cover && (
            <div className={styles.coverWrapper}>
              <Image
                src={issue.cover}
                alt={issue.title}
                fill
                className={styles.coverImage}
                priority
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div className={styles.infoSection}>
            <div className={styles.infoContainer}>
              <div className={styles.textContainer}>
                <SerifText className={styles.textTitle}>{article.title}</SerifText>
                <div className={styles.textFlexContainer}>
                  <MonoTextLight className={styles.textAuthor}>
                    {author ? (
                      <Link href={`/authors?author=${author.slug}`}>{author.name}</Link>
                    ) : (
                      ""
                    )}
                    {author && " - "}
                    {category ? (
                      <Link href={`/categories?category=${category.slug}`}>{category.name}</Link>
                    ) : (
                      ""
                    )}
                    {category && " - "}
                    {formatDateByLang(article.date, lang, isMobile)}
                  </MonoTextLight>
                </div>
                <Link
                  href="https://github.com/resemble-ai/chatterbox"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MonoTextLight className={styles.textTTS}>
                    Podcast powered by Chatterbox-TTS by Resemble AI (2025)
                  </MonoTextLight>
                </Link>
              </div>
            </div>
          </div>
        </div>

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
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={styles.progressBar}
            aria-label="Posizione nel podcast"
            style={{
              background: `linear-gradient(to right, var(--tertiary) 0%, var(--tertiary) ${totalPositions > 0 ? (currentPosition / Math.max(totalPositions - 1, 1)) * 100 : 0}%, var(--secondary) ${totalPositions > 0 ? (currentPosition / Math.max(totalPositions - 1, 1)) * 100 : 0}%, var(--secondary) 100%)`,
            }}
          />
          <MonoTextLight className={styles.time}>{formatTime(totalTime)}</MonoTextLight>
        </div>

        {/* Player Section */}
        <div className={styles.playerSection}>
          <div className={styles.buttons}>
            <div className={styles.buttonGroup}>
              <div ref={volumeButtonWrapperRef} className={styles.volumeButtonWrapper}>
                <Button
                  variants="unstyled"
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                  className={styles.controlButton}
                  aria-label="Volume"
                >
                  <Volume2 className={styles.icon} />
                </Button>
                {/* Volume Control - Absolute Positioned */}
                {showVolumeControl && (
                  <div ref={volumeControlRef} className={styles.volumeControlContainer}>
                    <VerticalRange
                      min={0}
                      max={100}
                      step={1}
                      value={volume}
                      onChange={handleVolumeChange}
                      formatValue={(val) => `${Math.round(val)}%`}
                    />
                  </div>
                )}
              </div>
              <Button
                variants="unstyled"
                onClick={backward}
                className={styles.controlButton}
                aria-label="Indietro di 10 secondi"
              >
                <Rewind className={styles.icon} />
              </Button>
            </div>

            <Button
              variants="unstyled"
              onClick={isPlaying ? pause : play}
              className={styles.playButton}
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              {isPlaying ? (
                <Pause className={styles.playIcon} />
              ) : (
                <Play className={styles.playIcon} />
              )}
            </Button>

            <div className={styles.buttonGroup}>
              <Button
                variants="unstyled"
                onClick={forward}
                className={styles.controlButton}
                aria-label="Avanti di 10 secondi"
              >
                <FastForward className={styles.icon} />
              </Button>
              <div ref={speedButtonWrapperRef} className={styles.speedButtonWrapper}>
                <Button
                  variants="unstyled"
                  onClick={() => setShowSpeedControl(!showSpeedControl)}
                  className={styles.controlButton}
                  aria-label="Velocità di riproduzione"
                >
                  <Zap className={styles.icon} />
                </Button>
                {/* Speed Control - Absolute Positioned */}
                {showSpeedControl && (
                  <div ref={speedControlRef} className={styles.speedControlContainer}>
                    <VerticalRange
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={playbackRate}
                      onChange={handlePlaybackRateChange}
                      formatValue={(val) => `${val.toFixed(1)}x`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Transcript */}
      {segments.length > 0 && (
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
      )}
    </div>
  );
}
