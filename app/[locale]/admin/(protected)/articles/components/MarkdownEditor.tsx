/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useCallback, useState } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import MediaSelector from "./MediaSelector";
import { getGitHubImageUrl } from "@/lib/github/images";

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
  const [isMounted, setIsMounted] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

  // Convertitore Markdown -> HTML
  const markdownToHtml = useCallback((markdown: string): string => {
    if (!markdown) return "";
    try {
      return marked.parse(markdown, { breaks: true }) as string;
    } catch (error) {
      console.error("Error converting Markdown to HTML:", error);
      return markdown;
    }
  }, []);

  // Convertitore HTML -> Markdown
  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html) return "";
    try {
      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
      });
      return turndownService.turndown(html);
    } catch (error) {
      console.error("Error converting HTML to Markdown:", error);
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
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    content: markdownToHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // Assicura che il componente venga renderizzato solo lato client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Aggiorna l'editor quando il valore cambia esternamente
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      const currentMarkdown = htmlToMarkdown(currentHtml);
      const newHtml = markdownToHtml(value);
      
      // Evita loop infiniti: aggiorna solo se il contenuto Markdown è diverso
      // Confronta i Markdown invece degli HTML per evitare differenze di formattazione
      if (currentMarkdown.trim() !== value.trim()) {
        editor.commands.setContent(newHtml, false);
      }
    }
  }, [value, editor, markdownToHtml, htmlToMarkdown]);

  if (!isMounted || !editor) {
    return (
      <div className="flex flex-col h-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className="flex-1 min-h-0 border border-gray-300 rounded-md p-4">
          <div className="animate-pulse text-gray-400">Caricamento editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
      )}
      
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-gray-50 rounded-t-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("bold") ? "bg-gray-300" : ""
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("italic") ? "bg-gray-300" : ""
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("strike") ? "bg-gray-300" : ""
          }`}
        >
          <s>S</s>
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-300" : ""
          }`}
        >
          H3
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("bulletList") ? "bg-gray-300" : ""
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("orderedList") ? "bg-gray-300" : ""
          }`}
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("blockquote") ? "bg-gray-300" : ""
          }`}
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("codeBlock") ? "bg-gray-300" : ""
          }`}
        >
          {"</>"}
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Inserisci l'URL del link:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 ${
            editor.isActive("link") ? "bg-gray-300" : ""
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => setIsMediaSelectorOpen(true)}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200"
        >
          🖼️
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Rimuovi Link
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 border border-gray-300 rounded-b-md overflow-auto bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={(imageUrl) => {
          // Converti il path relativo in URL GitHub
          const imageSrc = getGitHubImageUrl(imageUrl);
          editor.chain().focus().setImage({ src: imageSrc }).run();
        }}
      />
    </div>
  );
}
