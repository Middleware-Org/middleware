/* **************************************************
 * Imports
 **************************************************/
"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { mutate } from "swr";

import { useIssue } from "@/hooks/swr";
import { toast } from "@/hooks/use-toast";
import type { ActionResult } from "@/lib/actions/types";
import { getGitHubImageUrl } from "@/lib/github/images";
import type { Issue } from "@/lib/github/types";
import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";
import { generateSlug } from "@/lib/utils/slug";

import IssueMetaPanel from "./IssueMetaPanel";
import AudioJsonMediaSelector from "../../articles/components/AudioJsonMediaSelector";
import { adminFormCopy } from "../../components/adminFormCopy";
import { createIssueAction, updateIssueAction } from "../actions";
import styles from "../styles";

/* **************************************************
 * Types
 **************************************************/
interface IssueFormClientProps {
  issueSlug?: string; // Slug per edit mode
}

/* **************************************************
 * Submit Button Component
 **************************************************/
function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={styles.submitButton}>
      {pending
        ? adminFormCopy.common.save
        : editing
          ? adminFormCopy.common.update
          : adminFormCopy.common.create}
    </button>
  );
}

/* **************************************************
 * Image Upload Component
 **************************************************/
function ImageUpload({
  currentImage,
  onImageChange,
}: {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}) {
  const getPreviewUrl = (image: string | null | undefined): string | null => {
    if (!image) return null;
    if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return getGitHubImageUrl(image);
  };

  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const preview = useMemo(() => {
    return getPreviewUrl(currentImage);
  }, [currentImage]);

  function handleClick() {
    setIsImageSelectorOpen(true);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onImageChange("");
  }

  function handleSelectFromMedia(imageUrl: string) {
    onImageChange(imageUrl);
  }

  return (
    <div>
      <label className={styles.label}>{adminFormCopy.issue.coverImage}</label>
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
        aria-label={adminFormCopy.issue.selectCoverImage}
        className={styles.imageUpload}
        style={{ cursor: "pointer" }}
      >
        {preview ? (
          <div className={styles.imagePreview}>
            <Image
              src={preview}
              alt={adminFormCopy.issue.previewAlt}
              className={styles.imagePreviewImg}
              width={800}
              height={500}
              unoptimized
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20"
              >
                {adminFormCopy.issue.changeImage}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                {adminFormCopy.issue.remove}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary/80 mb-2">{adminFormCopy.issue.clickToSelect}</p>
            <p className="text-sm text-secondary/60">{adminFormCopy.issue.selectOrUpload}</p>
          </div>
        )}
      </div>

      <AudioJsonMediaSelector
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelect={handleSelectFromMedia}
        fileType="image"
        title={adminFormCopy.issue.coverModalTitle}
      />
    </div>
  );
}

/* **************************************************
 * Issue Form Client Component
 **************************************************/
export default function IssueFormClient({ issueSlug }: IssueFormClientProps) {
  const router = useRouter();
  const toLocale = useLocalizedPath();
  const editing = !!issueSlug;
  const editFormId = "issue-edit-form";

  const { issue } = useIssue(issueSlug || null);

  const formRef = useRef<HTMLFormElement>(null);
  const initialCoverImage = useMemo(() => issue?.cover || "", [issue?.cover]);
  const [coverImage, setCoverImage] = useState<string>(initialCoverImage);
  const [showOrder, setShowOrder] = useState<boolean>(() => issue?.showOrder ?? false);
  const [state, formAction] = useActionState<ActionResult<Issue> | null, FormData>(
    editing ? updateIssueAction : createIssueAction,
    null,
  );
  const handledStateRef = useRef<ActionResult<Issue> | null>(null);

  const [slugValue, setSlugValue] = useState(issue?.slug || "");
  const [, startDeleteTransition] = useTransition();
  void startDeleteTransition;

  // Sync showOrder with loaded issue
  useEffect(() => {
    if (issue?.showOrder !== undefined) {
      setShowOrder(issue.showOrder);
    }
  }, [issue?.showOrder]);

  useEffect(() => {
    if (issue?.cover && !coverImage) {
      setCoverImage(issue.cover);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.cover]);

  useEffect(() => {
    if (!state) return;
    if (handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (!state.success) {
      toast.actionResult(state, { errorTitle: adminFormCopy.issue.operationErrorTitle });
      return;
    }

    toast.success(
      state.message ||
        (editing ? adminFormCopy.issue.updateSuccess : adminFormCopy.issue.createSuccess),
    );
    formRef.current?.reset();
    mutate("/api/issues");
    if (editing && issueSlug) {
      mutate(`/api/issues/${issueSlug}`);
    }
    mutate("/api/github/merge/check");
    setCoverImage("");
    router.push(toLocale("/admin/issues"));
  }, [state, router, editing, issueSlug, toLocale]);

  function handleGenerateSlug() {
    const nativeFormData = formRef.current ? new FormData(formRef.current) : null;
    const title =
      typeof nativeFormData?.get("title") === "string"
        ? (nativeFormData.get("title") as string).trim()
        : "";
    if (title) {
      setSlugValue(generateSlug(title));
    }
  }

  const formContent = (
    <>
      {editing && issueSlug && <input type="hidden" name="slug" value={issueSlug} />}
      <input type="hidden" name="cover" value={coverImage} />
      {/* showOrder hidden input synced with state */}
      <input type="hidden" name="showOrder" value={showOrder ? "on" : ""} />

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          {adminFormCopy.issue.title}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={issue?.title || ""}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          {adminFormCopy.issue.description}
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={issue?.description || ""}
          required
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <ImageUpload currentImage={coverImage} onImageChange={(url) => setCoverImage(url)} />
      </div>

      <div className={styles.field}>
        <label htmlFor="color" className={styles.label}>
          {adminFormCopy.issue.color}
        </label>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue={issue?.color || "#000000"}
          required
          className="h-10 w-full cursor-pointer"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="date" className={styles.label}>
          {adminFormCopy.issue.date}
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={issue?.date || ""}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={issue?.published ?? false}
            className="w-4 h-4"
          />
          <span className={styles.label}>{adminFormCopy.issue.published}</span>
        </label>
      </div>

      <div className={styles.field}>
        <label htmlFor={editing ? "newSlug" : "slug"} className={styles.label}>
          {editing ? adminFormCopy.common.slugEditable : adminFormCopy.common.slugOptional}
        </label>
        <div className="relative">
          <input
            id={editing ? "newSlug" : "slug"}
            name={editing ? "newSlug" : "slug"}
            type="text"
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            className={styles.input}
            placeholder={
              editing ? issue?.slug || adminFormCopy.common.slugAuto : adminFormCopy.common.slugAuto
            }
          />
          <button
            type="button"
            onClick={handleGenerateSlug}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-tertiary/10 transition-colors duration-150"
            title={adminFormCopy.common.generateSlug}
          >
            <Sparkles className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      {/* In create mode: show showOrder checkbox and actions inline */}
      {!editing && (
        <>
          <div className={styles.field}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOrder}
                onChange={(e) => setShowOrder(e.target.checked)}
                className="w-4 h-4"
              />
              <span className={styles.label}>{adminFormCopy.issue.showNumbering}</span>
            </label>
          </div>

          <div className={styles.formActions}>
            <SubmitButton editing={editing} />
            <button
              type="button"
              onClick={() => router.push(toLocale("/admin/issues"))}
              className={styles.cancelButton}
            >
              {adminFormCopy.common.cancel}
            </button>
          </div>
        </>
      )}
    </>
  );

  if (editing && issue) {
    return (
      <div className={cn(styles.editorContainer, "items-start")}>
        <form
          id={editFormId}
          ref={formRef}
          action={formAction}
          className={cn(styles.form, "flex-1")}
        >
          <h2 className={styles.formTitle}>{adminFormCopy.issue.editTitle}</h2>
          {formContent}
        </form>
        <IssueMetaPanel
          issue={issue}
          issueSlug={issueSlug}
          formRef={formRef}
          formId={editFormId}
          showOrder={showOrder}
          onShowOrderChange={setShowOrder}
        />
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={styles.form}>
      <h2 className={styles.formTitle}>
        {editing ? adminFormCopy.issue.editTitle : adminFormCopy.issue.createTitle}
      </h2>
      {formContent}
    </form>
  );
}
