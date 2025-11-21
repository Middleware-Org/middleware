"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useState } from "react";
import HighlightedText from "./HighlightedText";

/* **************************************************
 * Types
 **************************************************/
type AudioSegment = {
  id: number;
  text: string;
  start: number;
  end: number;
};

type HighlightedTextWrapperProps = {
  text: string;
  audioChunksUrl?: string;
  articleId: string;
};

/* **************************************************
 * HighlightedTextWrapper
 **************************************************/
export default function HighlightedTextWrapper({
  text,
  audioChunksUrl,
  articleId,
}: HighlightedTextWrapperProps) {
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [currentSegmentId, setCurrentSegmentId] = useState<number | null>(null);

  // Carica i segmenti JSON
  useEffect(() => {
    if (!audioChunksUrl) {
      return;
    }

    const loadSegments = async () => {
      try {
        const response = await fetch(audioChunksUrl);
        if (!response.ok) {
          return;
        }
        const data: AudioSegment[] = await response.json();
        setSegments(data);
      } catch (error) {
        console.error("Error loading audio segments:", error);
      }
    };

    loadSegments();
  }, [audioChunksUrl]);

  // Ascolta gli eventi del tempo corrente dall'audio player
  useEffect(() => {
    if (segments.length === 0) {
      return;
    }

    const handleTimeUpdate = (event: CustomEvent) => {
      if (event.detail.articleId !== articleId) {
        return;
      }

      const currentTime = event.detail.currentTime;

      // Trova il segmento corrispondente al tempo corrente
      const activeSegment = segments.find(
        (segment) => currentTime >= segment.start && currentTime < segment.end,
      );

      if (activeSegment) {
        setCurrentSegmentId(activeSegment.id);
      } else {
        setCurrentSegmentId(null);
      }
    };

    window.addEventListener("audioTimeUpdate", handleTimeUpdate as EventListener);
    return () => {
      window.removeEventListener("audioTimeUpdate", handleTimeUpdate as EventListener);
    };
  }, [segments, articleId]);

  return <HighlightedText text={text} segments={segments} currentSegmentId={currentSegmentId} />;
}

