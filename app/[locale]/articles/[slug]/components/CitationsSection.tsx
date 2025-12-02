/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useRef } from "react";
import { MonoTextLight } from "@/components/atoms/typography";
import { scrollToElement } from "@/lib/utils/window";

/* **************************************************
 * Types
 **************************************************/
type Citation = {
  id: string;
  text: string;
  index: number;
};

interface CitationsSectionProps {
  citations: Citation[];
}

/* **************************************************
 * Citations Section Component
 **************************************************/
export default function CitationsSection({ citations }: CitationsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Gestisce lo scroll quando si clicca su una citazione nel testo (scrolla alla sezione citazioni)
    const handleHashChange = () => {
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith("citation-")) {
          setTimeout(() => {
            scrollToElement(hash, 150);
          }, 100);
        } else if (hash.startsWith("cit-")) {
          // Quando si clicca dalla sezione citazioni, scrolla al punto nel contenuto
          setTimeout(() => {
            scrollToElement(hash, 150);
          }, 100);
        }
      }
    };

    // Gestisce i click sui link delle citazioni nel contenuto
    const handleCitationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("citation-link")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        if (href) {
          window.history.pushState(null, "", href);
          handleHashChange();
        }
      }
    };

    // Controlla l'hash all'inizio
    handleHashChange();

    // Ascolta i cambiamenti dell'hash
    window.addEventListener("hashchange", handleHashChange);
    // Ascolta i click sui link delle citazioni nel contenuto
    document.addEventListener("click", handleCitationClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleCitationClick);
    };
  }, []);

  if (citations.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="citations"
      className="w-full flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5"
    >
      <div className="flex lg:flex-row md:flex-row flex-col justify-between gap-10">
        <div className="lg:w-1/4 lg:flex hidden"></div>
        <div className="lg:w-2/4 md:w-2/3 w-full">
          <ol className="space-y-6">
            {citations.map((citation) => (
              <li
                key={citation.id}
                id={`citation-${citation.index}`}
                className="flex gap-4 py-3 transition-colors duration-200 border-t border-secondary"
              >
                <a
                  href={`#cit-${citation.index}`}
                  className="text-tertiary font-medium shrink-0 hover:opacity-70 transition-opacity"
                  style={{ minWidth: "2em" }}
                >
                  {citation.index}.
                </a>
                <MonoTextLight className="text-base leading-relaxed flex-1">
                  {citation.text}
                </MonoTextLight>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:w-1/4 md:w-1/3 w-full lg:flex md:flex hidden"></div>
      </div>
    </section>
  );
}
