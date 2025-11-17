/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getGitHubImageUrl } from "@/lib/github/images";
import { getAllMediaAction } from "../../media/actions";
import type { MediaFile } from "@/lib/github/media";

/* **************************************************
 * Types
 **************************************************/
interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

/* **************************************************
 * Media Selector Component
 **************************************************/
export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMediaFiles();
    }
  }, [isOpen]);

  async function loadMediaFiles() {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllMediaAction();
      if (result.success && result.data) {
        setMediaFiles(result.data as MediaFile[]);
      } else {
        setError(result.success === false ? result.error : "Failed to load media files");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media files");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(imageUrl: string) {
    onSelect(imageUrl);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Seleziona Immagine</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && <div className="text-center py-8 text-gray-500">Caricamento immagini...</div>}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {!loading && !error && mediaFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessuna immagine disponibile. Vai alla sezione Media per caricarne una.
            </div>
          )}

          {!loading && !error && mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaFiles.map((file) => (
                <button
                  key={file.name}
                  type="button"
                  onClick={() => handleSelect(file.url)}
                  className="relative group border border-gray-300 rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={getGitHubImageUrl(file.url)}
                      alt={file.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                    {file.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
