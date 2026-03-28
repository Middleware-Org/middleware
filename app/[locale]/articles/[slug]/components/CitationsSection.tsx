/* **************************************************
 * Imports
 **************************************************/
import { MonoTextLight } from "@/components/atoms/typography";
import { sanitizeInlineHtml } from "@/lib/security/sanitizeHtml";

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

function linkifyPlainText(text: string): string {
  return text.replace(URL_REGEX, (url) => {
    const { href, trailing } = splitUrlAndTrailingPunctuation(url);
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="underline break-all">${href}</a>${trailing}`;
  });
}

function renderCitationHtml(text: string): string {
  const hasHtmlTags = /<[^>]+>/.test(text);

  if (hasHtmlTags) {
    return sanitizeInlineHtml(text);
  }

  return sanitizeInlineHtml(linkifyPlainText(text));
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
                className="citation-target flex gap-4 py-3 transition-colors duration-200 border-t border-secondary"
              >
                <a
                  href={`#cit-${citation.index}`}
                  className="text-tertiary font-medium shrink-0 hover:opacity-70 transition-opacity"
                  style={{ minWidth: "2em" }}
                >
                  {citation.index}.
                </a>
                <MonoTextLight
                  className="text-base leading-relaxed flex-1 min-w-0 wrap-anywhere [&_a]:underline [&_a]:break-all"
                  dangerouslySetInnerHTML={{ __html: renderCitationHtml(citation.text) }}
                />
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:w-1/4 md:w-1/3 w-full lg:flex md:flex hidden"></div>
      </div>
    </section>
  );
}
