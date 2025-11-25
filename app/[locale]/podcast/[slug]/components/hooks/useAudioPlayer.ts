/* **************************************************
 * Imports
 **************************************************/
import { useCallback, useEffect, useRef, useState } from "react";
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
  const saveThrottleMs = 3000;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [wasPlayingBeforeSeek, setWasPlayingBeforeSeek] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

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
                setCurrentTime(savedProgress.currentTime);
                setTotalTime(audio.duration);
                setCurrentPosition(
                  Math.floor((savedProgress.currentTime / audio.duration) * totalPositions),
                );
              }
            }
          } catch (error) {
            console.error("Errore nel ripristino anticipato:", error);
          }
        }
      } catch (error) {
        console.error("Errore nell'inizializzazione dello storage:", error);
      }
    };

    initStorageAndRestore();
  }, [podcastId, totalPositions]);

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
      setCurrentTime(newTime);

      if (audio.duration > 0) {
        const newPosition = Math.floor((newTime / audio.duration) * totalPositions);
        setCurrentPosition(newPosition);

        // Salva periodicamente sugli eventi timeupdate
        const now = Date.now();
        if (now - lastSaveTimeRef.current >= saveThrottleMs && isPlaying) {
          lastSaveTimeRef.current = now;
          const progressPercentage = (newTime / audio.duration) * 100;
          podcastProgressStorage
            .saveProgress(podcastId, newTime, audio.duration, progressPercentage, false)
            .catch((error) => {
              console.error("Errore nel salvataggio durante timeupdate:", error);
            });
        }
      }

      onTimeUpdate?.(newTime);
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
                setCurrentTime(savedProgress.currentTime);
                setCurrentPosition(
                  Math.floor((savedProgress.currentTime / audio.duration) * totalPositions),
                );
              }
            }
          } catch (error) {
            console.error("Errore nel ripristino del progresso:", error);
          }
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = async () => {
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
          console.error("Errore nel salvataggio dopo pause:", error);
        }
      }
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentPosition(0);

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
  }, [totalTime, totalPositions, podcastId, isPlaying, onTimeUpdate, saveThrottleMs]);

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
          console.error("Errore nel salvataggio dopo forward:", error);
        }
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
          console.error("Errore nel salvataggio dopo backward:", error);
        }
      }
    }
  }, [totalPositions, podcastId]);

  const seek = useCallback(
    async (newPosition: number) => {
      const audio = audioRef.current;
      if (audio) {
        const newTime = (newPosition / totalPositions) * audio.duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        setCurrentPosition(newPosition);

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
            console.error("Errore nel salvataggio dopo seek:", error);
          }
        }
      }
    },
    [totalPositions, podcastId],
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
