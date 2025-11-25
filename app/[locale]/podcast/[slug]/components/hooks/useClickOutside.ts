/* **************************************************
 * Imports
 **************************************************/
import { useEffect, RefObject } from "react";

/* **************************************************
 * Types
 **************************************************/
type UseClickOutsideProps = {
  isOpen: boolean;
  refs: RefObject<HTMLElement | null>[];
  onClose: () => void;
};

/* **************************************************
 * useClickOutside Hook
 * Gestisce il click outside per chiudere controlli
 **************************************************/
export function useClickOutside({ isOpen, refs, onClose }: UseClickOutsideProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      const isOutside = refs.every((ref) => {
        return ref.current && !ref.current.contains(target);
      });

      if (isOutside) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, refs, onClose]);
}

