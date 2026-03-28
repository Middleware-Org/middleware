/* **************************************************
 * Imports
 **************************************************/
import type { ReactNode } from "react";

import { MonoTextLight } from "@/components/atoms/typography";

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

const URL_REGEX = /https?:\/\/[^\s<>"]+/gi;

function splitUrlAndTrailingPunctuation(url: string) {
  const trimmed = url.match(/^(.*?)([),.;!?]+)$/);

  if (!trimmed) {
    return { href: url, trailing: "" };
  }

  return {
    href: trimmed[1],
    trailing: trimmed[2],
  };
}

function renderCitationText(text: string): ReactNode[] {
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const matchText = match[0];
    const index = match.index ?? -1;

    if (index < 0) {
      continue;
    }

    if (index > lastIndex) {
      content.push(text.slice(lastIndex, index));
    }

    const { href, trailing } = splitUrlAndTrailingPunctuation(matchText);

    content.push(
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all"
      >
        {href}
      </a>,
    );

    if (trailing) {
      content.push(trailing);
    }

    lastIndex = index + matchText.length;
  }

  if (lastIndex < text.length) {
    content.push(text.slice(lastIndex));
  }

  return content;
}

/* **************************************************
 * Citations Section Component
 **************************************************/
export default function CitationsSection({ citations }: CitationsSectionProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <section
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
                <MonoTextLight className="text-base leading-relaxed flex-1 min-w-0 wrap-anywhere">
                  {renderCitationText(citation.text)}
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
