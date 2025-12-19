/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { marked } from "marked";
import TurndownService from "turndown";
import { Link as LinkIcon, Image as ImageIcon, Quote } from "lucide-react";
import LinkModal from "./LinkModal";
import CitationModal from "./CitationModal";
import { Citation } from "./CitationExtension";
import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Dynamic Imports - Code Splitting
 **************************************************/
const MediaSelector = dynamic(() => import("./MediaSelector"), {
  ssr: false,
  loading: () => <div className="text-sm text-secondary/60">Caricamento...</div>,
});

/* **************************************************
 * Types
 **************************************************/
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  label?: string;
}

/* **************************************************
 * Markdown Editor Component
 **************************************************/
export default function MarkdownEditor({ value, onChange, label }: MarkdownEditorProps) {
  const [isMounted] = useState(() => typeof window !== "undefined");
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [currentCitationId, setCurrentCitationId] = useState<number | null>(null);
  const [currentCitationText, setCurrentCitationText] = useState<string>("");

  const markdownToHtml = useCallback((markdown: string): string => {
    if (!markdown) return "";
    try {
      // Sostituisci le citazioni nel formato [citation:ID:text] con HTML
      let processedMarkdown = markdown.replace(
        /\[citation:([^:]+):([^\]]+)\]/g,
        (match, citationId, citationText) => {
          const decodedText = citationText.replace(/\\:/g, ":");
          return `<span class="citation" data-citation-id="${citationId}" data-citation-text="${decodedText.replace(/"/g, "&quot;")}">[?]</span>`;
        },
      );

      // Supporta anche il formato vecchio [citation-ID] per retrocompatibilità
      processedMarkdown = processedMarkdown.replace(
        /\[citation-([^\]]+)\]/g,
        (match, citationId) => {
          return `<span class="citation" data-citation-id="${citationId}" data-citation-text="">[?]</span>`;
        },
      );

      return marked.parse(processedMarkdown, { breaks: true }) as string;
    } catch {
      return markdown;
    }
  }, []);

  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html) return "";
    try {
      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
      });

      // Aggiungi regola personalizzata per le citazioni
      turndownService.addRule("citation", {
        filter: (node) => {
          return (
            node.nodeName === "SPAN" &&
            node.classList?.contains("citation") &&
            node.hasAttribute("data-citation-id")
          );
        },
        replacement: (content, node) => {
          const citationId = (node as HTMLElement).getAttribute("data-citation-id") || "";
          const citationText = (node as HTMLElement).getAttribute("data-citation-text") || "";
          // Salva in formato [citation:ID:text] per poterlo parsare dopo
          return `[citation:${citationId}:${citationText.replace(/:/g, "\\:")}]`;
        },
      });

      return turndownService.turndown(html);
    } catch {
      return html;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-tertiary hover:text-tertiary/80 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      Citation.configure({
        HTMLAttributes: {
          class: "citation",
        },
      }),
    ],
    content: markdownToHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] p-4 text-secondary",
      },
      handleClick: (view, pos, event) => {
        const { state } = view;
        const $pos = state.doc.resolve(pos);
        const node = $pos.nodeAfter || $pos.nodeBefore;

        // Controlla se si è cliccato su una citazione
        if (node && node.type.name === "citation") {
          event.preventDefault();
          event.stopPropagation();
          const citationId = node.attrs.citationId || null;
          const citationText = node.attrs.citationText || "";
          setCurrentCitationId(citationId);
          setCurrentCitationText(citationText);
          setIsCitationModalOpen(true);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      const currentMarkdown = htmlToMarkdown(currentHtml);
      const newHtml = markdownToHtml(value);

      if (currentMarkdown.trim() !== value.trim()) {
        editor.commands.setContent(newHtml, { emitUpdate: false });
      }
    }
  }, [value, editor, markdownToHtml, htmlToMarkdown]);

  if (!isMounted || !editor) {
    return (
      <div className="flex flex-col h-full">
        {label && <label className="block mb-2 text-sm font-medium text-secondary">{label}</label>}
        <div className="flex-1 min-h-0 border border-secondary p-4 bg-primary">
          <div className="animate-pulse text-secondary/60">Caricamento editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {label && <label className="block mb-2 text-sm font-medium text-secondary">{label}</label>}

      {/* Toolbar */}
      <div className="border-b border-secondary p-2 flex flex-wrap gap-2 bg-primary">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("bold") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("italic") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("strike") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          <s>S</s>
        </button>
        <div className="w-px bg-secondary mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("heading", { level: 1 }) ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("heading", { level: 2 }) ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("heading", { level: 3 }) ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          H3
        </button>
        <div className="w-px bg-secondary mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("bulletList") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("orderedList") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("blockquote") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          &quot;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white ${
            editor.isActive("codeBlock") ? "bg-tertiary text-white" : "text-secondary"
          }`}
        >
          {"</>"}
        </button>
        <div className="w-px bg-secondary mx-1" />
        <button
          type="button"
          onClick={() => {
            setIsLinkModalOpen(true);
          }}
          className={`px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white flex items-center gap-1 ${
            editor.isActive("link") ? "bg-tertiary text-white" : "text-secondary"
          }`}
          title="Inserisci link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsMediaSelectorOpen(true)}
          className="px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white text-secondary flex items-center gap-1"
          title="Inserisci immagine"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setCurrentCitationId(null);
            setCurrentCitationText("");
            setIsCitationModalOpen(true);
          }}
          className="px-3 py-1 text-sm transition-all duration-150 hover:bg-tertiary hover:text-white text-secondary flex items-center gap-1"
          title="Inserisci citazione"
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 border border-secondary overflow-auto bg-primary">
        <EditorContent editor={editor} />
      </div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={(imageUrl) => {
          const imageSrc = getGitHubImageUrl(imageUrl);
          editor.chain().focus().setImage({ src: imageSrc }).run();
        }}
      />

      {/* Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={(url) => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to);

          if (selectedText) {
            // Se c'è testo selezionato, trasformalo in link
            editor.chain().focus().setLink({ href: url }).run();
          } else {
            // Se non c'è testo selezionato, inserisci l'URL come link
            editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
          }
        }}
        currentUrl={editor.getAttributes("link").href}
      />

      {/* Citation Modal */}
      <CitationModal
        isOpen={isCitationModalOpen}
        onClose={() => {
          setIsCitationModalOpen(false);
          setCurrentCitationId(null);
          setCurrentCitationText("");
        }}
        onInsert={(citationId, citationText) => {
          if (currentCitationId) {
            // Aggiorna citazione esistente (solo il testo, l'indice viene ricalcolato automaticamente)
            // Trova il nodo con l'ID corrente e aggiorna solo il testo
            editor
              .chain()
              .focus()
              .updateAttributes("citation", {
                citationText,
              })
              .run();
          } else {
            // Genera un ID univoco basato sul timestamp per identificare la citazione
            // L'indice visualizzato viene calcolato automaticamente dal nodeView in base alla posizione
            const uniqueId = `citation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Inserisci nuova citazione
              editor
                .chain()
                .focus()
                .insertContent({
                type: "citation",
                attrs: {
                  citationId: uniqueId,
                  citationText,
                },
                })
                .run();
            }
        }}
        currentCitationId={currentCitationId}
        currentCitationText={currentCitationText}
        nextCitationId={(() => {
          // Non serve più calcolare il prossimo ID, ma lo manteniamo per compatibilità
          return 1;
        })()}
      />
    </div>
  );
}
