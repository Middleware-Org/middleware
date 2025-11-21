"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Rewind, FastForward } from "lucide-react";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { saveArticleProgress, getArticleProgress } from "@/lib/storage/articleProgress";

interface AudioPlayerProps {
  audioUrl?: string;
  articleId: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, articleId }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [displayIsPlaying, setDisplayIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [totalPositions] = useState<number>(1000);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState<boolean>(false);

  const iconTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  useAudioProgress({
    articleId,
    currentTime,
    totalTime,
    isPlaying,
  });

  useEffect(() => {
    if (iconTimeoutRef.current) {
      clearTimeout(iconTimeoutRef.current);
    }

    iconTimeoutRef.current = setTimeout(() => {
      if (isDragging && wasPlayingBeforeSeek) {
        setDisplayIsPlaying(true);
      } else {
        setDisplayIsPlaying(isPlaying);
      }
      iconTimeoutRef.current = null;
    }, 150);
  }, [isPlaying, isDragging, wasPlayingBeforeSeek]);

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

      // Emetti evento per sincronizzazione con evidenziazione testo
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("audioTimeUpdate", {
            detail: {
              articleId,
              currentTime: newTime,
              totalTime: audio.duration,
            },
          }),
        );
      }
    };

    const handleLoadedMetadata = () => {
      setTotalTime(audio.duration);
    };

    const handleCanPlay = () => {
      if (audio.duration > 0 && totalTime === 0) {
        setTotalTime(audio.duration);
      }

      // Ripristina il progresso salvato quando l'audio è pronto
      if (!isInitializedRef.current && audio.duration > 0) {
        isInitializedRef.current = true;

        // Aspetta un po' per assicurarsi che l'audio sia completamente caricato
        setTimeout(() => {
          getArticleProgress(articleId).then((savedProgress) => {
            if (
              savedProgress &&
              !savedProgress.isCompleted &&
              savedProgress.currentTime > 0 &&
              savedProgress.currentTime < audio.duration
            ) {
              // Ripristina la posizione salvata
              audio.currentTime = savedProgress.currentTime;
              setCurrentTime(savedProgress.currentTime);
              const position = Math.floor(
                (savedProgress.progressPercentage / 100) * totalPositions,
              );
              setCurrentPosition(position);

              // Emetti evento per ripristinare la posizione
              window.dispatchEvent(
                new CustomEvent("restoreAudioPosition", {
                  detail: {
                    time: savedProgress.currentTime,
                    position: savedProgress.progressPercentage,
                  },
                }),
              );
            }
          });
        }, 300);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (typeof window === "undefined") return;

      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentPosition(0);

      if (audio && audio.duration > 0) {
        window.dispatchEvent(
          new CustomEvent("audioEnded", {
            detail: {
              articleId,
              currentTime: 0,
              totalTime: audio.duration,
              progressPercentage: 0,
            },
          }),
        );
      }
    };

    const handleRestorePosition = (event: CustomEvent) => {
      if (audio && event.detail.time) {
        audio.currentTime = event.detail.time;
        setCurrentTime(event.detail.time);
        if (event.detail.position !== undefined) {
          setCurrentPosition(event.detail.position);
        }
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    window.addEventListener("restoreAudioPosition", handleRestorePosition as EventListener);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      window.removeEventListener("restoreAudioPosition", handleRestorePosition as EventListener);
    };
  }, [totalTime, articleId, totalPositions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.load();

      const checkDuration = () => {
        if (audio.duration && audio.duration > 0) {
          setTotalTime(audio.duration);
        } else {
          setTimeout(checkDuration, 100);
        }
      };

      setTimeout(checkDuration, 500);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (iconTimeoutRef.current) {
        clearTimeout(iconTimeoutRef.current);
      }
    };
  }, []);

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

  const forward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
    }
  }, []);

  const backward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
    }
  }, []);

  const handleRangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (audio) {
        const newPosition = parseFloat(e.target.value);
        const newTime = (newPosition / totalPositions) * audio.duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        setCurrentPosition(newPosition);
      }
    },
    [totalPositions],
  );

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
    setWasPlayingBeforeSeek(isPlaying);
    if (isPlaying) {
      pause();
    }
  }, [isPlaying, pause]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (wasPlayingBeforeSeek) {
      play();
    }
  }, [wasPlayingBeforeSeek, play]);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
    setWasPlayingBeforeSeek(isPlaying);
    if (isPlaying) {
      pause();
    }
  }, [isPlaying, pause]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (wasPlayingBeforeSeek) {
      play();
    }
  }, [wasPlayingBeforeSeek, play]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="w-full lg:min-w-[512px] md:min-w-[512px] min-w-none">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center justify-center gap-6">
        <Button
          variants="unstyled"
          onClick={backward}
          className="p-0! w-10! h-10 flex items-center justify-center rounded-full bg-secondary/20 border border-secondary"
          aria-label="Indietro di 5 secondi"
        >
          <Rewind className="text-base text-secondary mr-[2px]" />
        </Button>

        <Button
          variants="unstyled"
          onClick={isPlaying ? pause : play}
          className="p-0! w-10! h-10 flex items-center justify-center rounded-full bg-primary border border-secondary"
          aria-label={isPlaying ? "Pausa" : "Riproduci"}
        >
          {displayIsPlaying ? (
            <Pause className="text-base text-secondary" />
          ) : (
            <Play className="text-base text-secondary" />
          )}
        </Button>

        <Button
          variants="unstyled"
          onClick={forward}
          className="p-0! w-10! h-10 flex items-center justify-center rounded-full bg-secondary/20 border border-secondary"
          aria-label="Avanti di 5 secondi"
        >
          <FastForward className="text-base text-secondary ml-[2px]" />
        </Button>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs text-secondary gap-4">
        <MonoTextLight>{formatTime(currentTime)}</MonoTextLight>
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
          className="w-full h-2 bg-secondary/10 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-0"
          aria-label="Posizione nel testo"
          style={{
            background: `linear-gradient(to right, var(--tertiary) 0%, var(--tertiary) ${totalPositions > 0 ? (currentPosition / Math.max(totalPositions - 1, 1)) * 100 : 0}%, var(--secondary) ${totalPositions > 0 ? (currentPosition / Math.max(totalPositions - 1, 1)) * 100 : 0}%, var(--secondary) 100%)`,
          }}
        />
        <MonoTextLight>{formatTime(totalTime)}</MonoTextLight>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid var(--secondary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid var(--secondary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]:focus {
          outline: none;
          box-shadow: none;
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          outline: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]:focus::-moz-range-thumb {
          outline: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;

interface UseAudioProgressProps {
  articleId: string;
  currentTime: number;
  totalTime: number;
  isPlaying: boolean;
}

export const useAudioProgress = ({
  articleId,
  currentTime,
  totalTime,
  isPlaying,
}: UseAudioProgressProps) => {
  const lastSavedTimeRef = useRef<number>(-1);
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlaybackTimeRef = useRef<number>(0);
  const pendingSaveRef = useRef<boolean>(false);

  const saveProgressToStorage = useCallback(async () => {
    if (pendingSaveRef.current) return;

    if (totalTime === 0 || currentTime === 0) return;

    const progressPercentage = (currentTime / totalTime) * 100;
    const playbackTimeSinceLastSave = currentTime - lastPlaybackTimeRef.current;

    const timeDifference = Math.abs(progressPercentage - lastSavedTimeRef.current);
    const shouldSave = timeDifference > 1 || playbackTimeSinceLastSave > 5;

    if (!shouldSave) return;

    pendingSaveRef.current = true;

    try {
      await saveArticleProgress(articleId, currentTime, totalTime, progressPercentage);
      lastSavedTimeRef.current = progressPercentage;
      lastPlaybackTimeRef.current = currentTime;
    } catch (error) {
      console.error("Errore nel salvataggio del progresso:", error);
    } finally {
      pendingSaveRef.current = false;
    }
  }, [articleId, currentTime, totalTime]);

  //   useEffect(() => {
  //     if (isInitializedRef.current || totalTime === 0) return;

  //     const initializeStorage = async () => {
  //       if (typeof window === "undefined") return;

  //       try {
  //         await articleStorageService.init();

  //         let savedProgress = await articleStorageService.getArticleProgress(articleId);

  //         if (!savedProgress) {
  //           const fullArticleId = `content/articles/${articleId}.md`;
  //           savedProgress = await articleStorageService.getArticleProgress(fullArticleId);
  //         }

  //         if (
  //           savedProgress?.audioCurrentTime &&
  //           !savedProgress.isCompleted &&
  //           savedProgress.audioCurrentTime > 0
  //         ) {
  //           window.dispatchEvent(
  //             new CustomEvent("restoreAudioPosition", {
  //               detail: {
  //                 time: savedProgress.audioCurrentTime,
  //                 position: savedProgress.audioProgress || 0,
  //               },
  //             }),
  //           );

  //           lastSavedTimeRef.current = savedProgress.audioProgress || 0;
  //           lastPlaybackTimeRef.current = savedProgress.audioCurrentTime;
  //         }

  //         isInitializedRef.current = true;
  //       } catch (error) {
  //         console.error("Errore inizializzazione storage:", error);
  //       }
  //     };

  //     initializeStorage();
  //   }, [articleId, totalTime]);

  // Listener automatico per quando l'audio finisce

  useEffect(() => {
    const handleAudioEnded = async (event: CustomEvent) => {
      if (event.detail.articleId === articleId) {
        try {
          await saveArticleProgress(
            articleId,
            event.detail.currentTime,
            event.detail.totalTime,
            event.detail.progressPercentage,
          );
          lastSavedTimeRef.current = event.detail.progressPercentage;
          lastPlaybackTimeRef.current = event.detail.currentTime;
        } catch (error) {
          console.error("Errore nel salvataggio automatico del progresso a 0:", error);
        }
      }
    };

    window.addEventListener("audioEnded", handleAudioEnded as unknown as EventListener);

    return () => {
      window.removeEventListener("audioEnded", handleAudioEnded as unknown as EventListener);
    };
  }, [articleId]);

  useEffect(() => {
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
      saveProgressIntervalRef.current = null;
    }

    if (isPlaying) {
      saveProgressToStorage();

      saveProgressIntervalRef.current = setInterval(() => {
        saveProgressToStorage();
      }, 5000);
    } else {
      saveProgressToStorage();
    }
  }, [isPlaying, saveProgressToStorage]);

  useEffect(() => {
    return () => {
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
      }

      if (currentTime > 0 && totalTime > 0) {
        saveProgressToStorage();
      }
    };
  }, [currentTime, totalTime, saveProgressToStorage]);

  return {
    saveProgressToStorage,
  };
};
