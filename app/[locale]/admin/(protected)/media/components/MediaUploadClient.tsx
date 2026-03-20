/* **************************************************
 * Imports
 **************************************************/
"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";

import { toast } from "@/hooks/use-toast";

import { adminFormCopy } from "../../components/adminFormCopy";
import styles from "../styles";

/* **************************************************
 * Media Upload Client Component
 **************************************************/
export default function MediaUploadClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [fileType, setFileType] = useState<"image" | "audio" | "json">("image");
  const [isPending, setIsPending] = useState(false);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine file type
    let detectedType: "image" | "audio" | "json" = "image";
    if (file.type.startsWith("image/")) {
      detectedType = "image";
    } else if (
      file.type.startsWith("audio/") ||
      file.name.endsWith(".mp3") ||
      file.name.endsWith(".wav")
    ) {
      detectedType = "audio";
    } else if (file.type === "application/json" || file.name.endsWith(".json")) {
      detectedType = "json";
    } else {
      toast.warning(
        adminFormCopy.mediaUpload.unsupportedFormatTitle,
        adminFormCopy.mediaUpload.unsupportedFormatMessage,
      );
      return;
    }

    setFileType(detectedType);

    // Validate file size (max 50MB for audio, 10MB for others)
    const maxSize = detectedType === "audio" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.warning(`La dimensione del file deve essere inferiore a ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Set filename from file name (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setFilename(nameWithoutExt);

    // Save the original file for upload (more efficient than base64)
    setSelectedFile(file);

    // Create preview as base64 for display only
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    setPreview(null);
    setSelectedFile(null);
    setFilename("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (formRef.current) {
      formRef.current.reset();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      toast.warning(adminFormCopy.mediaUpload.selectFileBeforeUpload);
      return;
    }

    setIsPending(true);

    try {
      // Generate filename
      let finalFilename: string;
      if (filename) {
        const extensions = {
          image: /\.(jpg|jpeg|png|gif|webp)$/i,
          audio: /\.(mp3|wav)$/i,
          json: /\.json$/i,
        };
        const defaultExt = {
          image: "jpg",
          audio: "mp3",
          json: "json",
        };

        if (!filename.match(extensions[fileType])) {
          finalFilename = `${filename}.${defaultExt[fileType]}`;
        } else {
          finalFilename = filename;
        }
      } else {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const extensions = {
          image: "jpg",
          audio: "mp3",
          json: "json",
        };
        finalFilename = `file-${timestamp}-${random}.${extensions[fileType]}`;
      }

      // Upload file directly to Vercel Blob Storage using direct client upload
      // This bypasses serverless function size limits
      // The filename will be processed by the server to add the media/ prefix
      await upload(`media/${finalFilename}`, selectedFile, {
        access: "public",
        contentType:
          selectedFile.type ||
          (fileType === "image"
            ? "image/jpeg"
            : fileType === "audio"
              ? "audio/mpeg"
              : "application/json"),
        handleUploadUrl: "/api/media/upload-blob",
      });

      // Success - invalidate cache and reset form
      toast.success(adminFormCopy.mediaUpload.uploadSuccess);
      // Invalida la cache SWR per forzare il refetch
      const { mutate } = await import("swr");
      mutate("/api/media");
      mutate("/api/github/merge/check");
      handleRemove();
      formRef.current?.reset();
    } catch (error) {
      toast.error(
        adminFormCopy.mediaUpload.uploadErrorTitle,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setIsPending(false);
    }
  }

  function renderPreview() {
    if (!preview) return null;

    if (fileType === "image") {
      return (
        <div className={styles.imagePreview}>
          <Image
            src={preview}
            alt="Preview"
            className={styles.imagePreviewImg}
            width={800}
            height={500}
            unoptimized
          />
        </div>
      );
    } else if (fileType === "audio") {
      return (
        <div className="p-4 border border-secondary bg-primary">
          <audio controls src={preview} className="w-full">
            Il tuo browser non supporta l&apos;elemento audio.
          </audio>
        </div>
      );
    } else if (fileType === "json") {
      try {
        // Decode base64 and handle UTF-8 encoding correctly
        const base64Data = preview.includes(",") ? preview.split(",")[1] : preview;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const jsonContent = new TextDecoder("utf-8").decode(bytes);
        const parsed = JSON.parse(jsonContent);
        return (
          <div className="p-4 border border-secondary bg-primary max-h-64 overflow-auto">
            <pre className="text-xs text-secondary whitespace-pre-wrap font-mono">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        );
      } catch (err) {
        return (
          <div className="p-4 border border-secondary bg-primary">
            <p className="text-sm text-secondary">{adminFormCopy.mediaUpload.jsonSelected}</p>
            <p className="text-xs text-secondary/60 mt-1">
              {err instanceof Error ? err.message : adminFormCopy.mediaUpload.jsonParseError}
            </p>
          </div>
        );
      }
    }
    return null;
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>{adminFormCopy.mediaUpload.title}</h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>{adminFormCopy.mediaUpload.fileLabel}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/mp3,audio/wav,audio/mpeg,.json,application/json"
            onChange={handleFileSelect}
            className="hidden"
            required
          />
          <div
            onClick={handleClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={adminFormCopy.mediaUpload.selectFileToUpload}
            className={styles.imageUpload}
          >
            {preview ? (
              <div>
                {renderPreview()}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20"
                  >
                    {adminFormCopy.mediaUpload.changeFile}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    {adminFormCopy.mediaUpload.remove}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary/80 mb-2">
                  {adminFormCopy.mediaUpload.clickToSelectFile}
                </p>
                <p className="text-sm text-secondary/60">
                  {adminFormCopy.mediaUpload.fileTypesHint}
                </p>
              </div>
            )}
          </div>
        </div>

        {preview && (
          <div className={styles.field}>
            <label htmlFor="filename" className={styles.label}>
              {adminFormCopy.mediaUpload.filenameOptional}
            </label>
            <input
              id="filename"
              name="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={styles.input}
              placeholder={adminFormCopy.mediaUpload.autoGeneratedPlaceholder}
            />
            <p className="text-xs text-secondary/60 mt-1">
              {adminFormCopy.mediaUpload.filenameHelp}
            </p>
          </div>
        )}

        {preview && (
          <div className="mt-4">
            <button type="submit" disabled={isPending} className={styles.submitButton}>
              {isPending
                ? adminFormCopy.mediaUpload.uploading
                : adminFormCopy.mediaUpload.uploadFile}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
