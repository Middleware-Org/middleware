"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AudioPlayer from "@/components/organism/audioPlayer";

/* **************************************************
 * Types
 **************************************************/
type AudioPlayerWrapperProps = {
  audioUrl: string;
  articleId: string;
};

/* **************************************************
 * AudioPlayerWrapper
 **************************************************/
export default function AudioPlayerWrapper({
  audioUrl,
  articleId,
}: AudioPlayerWrapperProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Se siamo in cima alla pagina, mostra sempre
          if (currentScrollY < 100) {
            setIsVisible(true);
          } else {
            // Se scrolliamo verso il basso, nascondi
            // Se scrolliamo verso l'alto, mostra
            const scrollDifference = currentScrollY - lastScrollY;
            if (Math.abs(scrollDifference) > 5) {
              // Soglia minima per evitare cambiamenti troppo frequenti
              if (scrollDifference > 0) {
                setIsVisible(false);
              } else {
                setIsVisible(true);
              }
            }
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-[600px] mx-auto fixed bottom-0 md:bottom-4 left-0 right-0 bg-primary border border-secondary z-40 px-4 py-4 md:px-10 lg:px-10"
    >
      <div className="w-full mx-auto">
        <AudioPlayer audioUrl={audioUrl} articleId={articleId} />
      </div>
    </motion.div>
  );
}

