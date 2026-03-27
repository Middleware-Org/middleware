/* **************************************************
 * Imports
 **************************************************/
import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { podcastProgressStorage } from "@/lib/storage/podcastProgress";

/* **************************************************
 * Types
 **************************************************/
type UseAudioPlayerProps = {
  audioSrc: string;
  podcastId: string;
  totalPositions: number;
  onTimeUpdate?: (currentTime: number) => void;
};

/* **************************************************
 * useAudioPlayer Hook
 * Gestisce la logica di riproduzione audio
 **************************************************/
export function useAudioPlayer({
  audioSrc,
  podcastId,
  totalPositions,
  onTimeUpdate,
}: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRestoredRef = useRef<boolean>(false);
  const lastSaveTimeRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);
  const onTimeUpdateRef = useRef<typeof onTimeUpdate>(onTimeUpdate);
  const isPlayingRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const currentPositionRef = useRef<number>(0);
  const uiUpdateThrottleMs = 200;
  const saveThrottleMs = 3000;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  const updatePlaybackState = useCallback(
    (newTime: number, duration: number, options?: { force?: boolean }) => {
      const force = options?.force ?? false;
      const normalizedTime = Number.isFinite(newTime) ? newTime : 0;
      const normalizedDuration = duration > 0 ? duration : 0;
      const normalizedPosition =
        normalizedDuration > 0
          ? Math.floor((normalizedTime / normalizedDuration) * totalPositions)
          : 0;

      if (force || normalizedTime !== currentTimeRef.current) {
        currentTimeRef.current = normalizedTime;
        setCurrentTime(normalizedTime);
      }

      if (force || normalizedPosition !== currentPositionRef.current) {
        currentPositionRef.current = normalizedPosition;
        setCurrentPosition(normalizedPosition);
      }
    },
    [totalPositions],
  );

  // Initialize storage and restore progress
  useEffect(() => {
    const initStorageAndRestore = async () => {
      try {
        await podcastProgressStorage.init();

        // Prova a ripristinare il progresso subito se l'audio è già caricato
        const audio = audioRef.current;
        if (audio && audio.duration > 0 && !progressRestoredRef.current) {
          progressRestoredRef.current = true;

          try {
            const savedProgress = await podcastProgressStorage.getProgress(podcastId);

            if (savedProgress) {
              const timeDifference = Math.abs(savedProgress.totalTime - audio.duration);
              const isDurationMatch = timeDifference < 0.5;

              if (
                !savedProgress.isCompleted &&
                savedProgress.currentTime > 0 &&
                savedProgress.currentTime < savedProgress.totalTime &&
                isDurationMatch
              ) {
                audio.currentTime = savedProgress.currentTime;
                setTotalTime(audio.duration);
                updatePlaybackState(savedProgress.currentTime, audio.duration, { force: true });
              }
            }
          } catch (error) {
            toast.error(
              "Errore nel ripristino del progresso",
              error instanceof Error ? error.message : undefined,
            );
          }
        }
      } catch (error) {
        toast.error(
          "Errore nell'inizializzazione dello storage",
          error instanceof Error ? error.message : undefined,
        );
      }
    };

    initStorageAndRestore();
  }, [podcastId, totalPositions, updatePlaybackState]);

  // Start auto-save when audio is ready and playing
  useEffect(() => {
    if (totalTime === 0) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    podcastProgressStorage.startAutoSave(
      podcastId,
      () => audio.currentTime,
      () => audio.duration || totalTime,
    );

    return () => {
      podcastProgressStorage.stopAutoSave();
    };
  }, [podcastId, totalTime, isPlaying]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const newTime = audio.currentTime;
      const duration = audio.duration;
      const now = Date.now();

      if (duration > 0) {
        const newPosition = Math.floor((newTime / duration) * totalPositions);
        const shouldUpdateUi =
          now - lastUiUpdateRef.current >= uiUpdateThrottleMs ||
          Math.abs(newTime - currentTimeRef.current) >= 0.25 ||
          Math.abs(newPosition - currentPositionRef.current) >= 3;

        if (shouldUpdateUi) {
          lastUiUpdateRef.current = now;
          updatePlaybackState(newTime, duration);
        }

        // Salva periodicamente sugli eventi timeupdate
        if (now - lastSaveTimeRef.current >= saveThrottleMs && isPlayingRef.current) {
          lastSaveTimeRef.current = now;
          const progressPercentage = (newTime / duration) * 100;
          podcastProgressStorage
            .saveProgress(podcastId, newTime, duration, progressPercentage, false)
            .catch(() => {});
        }
      } else {
        updatePlaybackState(newTime, duration);
      }

      onTimeUpdateRef.current?.(newTime);
    };

    const handleLoadedMetadata = () => {
      setTotalTime(audio.duration);
    };

    const handleCanPlay = async () => {
      if (audio.duration > 0) {
        if (totalTime === 0) {
          setTotalTime(audio.duration);
        }

        // Ripristina la posizione salvata quando l'audio è pronto (solo una volta)
        if (!progressRestoredRef.current) {
          progressRestoredRef.current = true;

          try {
            const savedProgress = await podcastProgressStorage.getProgress(podcastId);

            if (savedProgress) {
              const timeDifference = Math.abs(savedProgress.totalTime - audio.duration);
              const isDurationMatch = timeDifference < 0.5;

              if (
                !savedProgress.isCompleted &&
                savedProgress.currentTime > 0 &&
                savedProgress.currentTime < savedProgress.totalTime &&
                isDurationMatch
              ) {
                audio.currentTime = savedProgress.currentTime;
                updatePlaybackState(savedProgress.currentTime, audio.duration, { force: true });
              }
            }
          } catch (error) {
            toast.error(
              "Errore nel ripristino del progresso",
              error instanceof Error ? error.message : undefined,
            );
          }
        }
      }
    };

    const handlePlay = () => {
      isPlayingRef.current = true;
      setIsPlaying(true);
    };

    const handlePause = async () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      const audio = audioRef.current;
      if (audio && audio.duration > 0) {
        const progressPercentage = (audio.currentTime / audio.duration) * 100;
        lastSaveTimeRef.current = Date.now();
        try {
          await podcastProgressStorage.saveImmediately(
            podcastId,
            audio.currentTime,
            audio.duration,
            progressPercentage,
          );
        } catch (error) {
          toast.error(
            "Errore nel salvataggio del progresso",
            error instanceof Error ? error.message : undefined,
          );
        }
      }
    };

    const handleEnded = async () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      updatePlaybackState(0, totalTime, { force: true });

      podcastProgressStorage.stopAutoSave();

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
  }, [
    totalTime,
    totalPositions,
    podcastId,
    saveThrottleMs,
    uiUpdateThrottleMs,
    updatePlaybackState,
  ]);

  // Load audio source
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioSrc) {
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
  }, [audioSrc]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  // Update playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const wasPlaying = !audio.paused;
      audio.playbackRate = playbackRate;
      if (wasPlaying) {
        audio.play().catch((error) => {
          toast.error(
            "Errore nella riproduzione audio",
            error instanceof Error ? error.message : undefined,
          );
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
      updatePlaybackState(newTime, audio.duration, { force: true });

      if (audio.duration > 0) {
        const progressPercentage = (newTime / audio.duration) * 100;
        lastSaveTimeRef.current = Date.now();
        try {
          await podcastProgressStorage.saveImmediately(
            podcastId,
            newTime,
            audio.duration,
            progressPercentage,
          );
        } catch (error) {
          toast.error(
            "Errore nel salvataggio del progresso",
            error instanceof Error ? error.message : undefined,
          );
        }
      }
    }
  }, [podcastId, updatePlaybackState]);

  const backward = useCallback(async () => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(audio.currentTime - 10, 0);
      audio.currentTime = newTime;
      updatePlaybackState(newTime, audio.duration, { force: true });

      if (audio.duration > 0) {
        const progressPercentage = (newTime / audio.duration) * 100;
        lastSaveTimeRef.current = Date.now();
        try {
          await podcastProgressStorage.saveImmediately(
            podcastId,
            newTime,
            audio.duration,
            progressPercentage,
          );
        } catch (error) {
          toast.error(
            "Errore nel salvataggio del progresso",
            error instanceof Error ? error.message : undefined,
          );
        }
      }
    }
  }, [podcastId, updatePlaybackState]);

  const seek = useCallback(
    async (newPosition: number, options?: { persist?: boolean }) => {
      const audio = audioRef.current;
      if (audio) {
        const shouldPersist = options?.persist ?? true;
        const newTime = (newPosition / totalPositions) * audio.duration;
        audio.currentTime = newTime;
        updatePlaybackState(newTime, audio.duration, { force: true });

        if (shouldPersist && audio.duration > 0) {
          const progressPercentage = (newTime / audio.duration) * 100;
          lastSaveTimeRef.current = Date.now();
          try {
            await podcastProgressStorage.saveImmediately(
              podcastId,
              newTime,
              audio.duration,
              progressPercentage,
            );
          } catch (error) {
            toast.error(
              "Errore nel salvataggio del progresso",
              error instanceof Error ? error.message : undefined,
            );
          }
        }
      }
    },
    [podcastId, totalPositions, updatePlaybackState],
  );

  return {
    audioRef,
    isPlaying,
    currentTime,
    totalTime,
    currentPosition,
    totalPositions,
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
  };
}
