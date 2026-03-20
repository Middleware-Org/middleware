"use client";

import { toast as sonnerToast } from "sonner";

import type { ActionResult } from "@/lib/actions/types";

type ToastKind = "success" | "error" | "warning" | "info";

type ToastPayload = {
  title: string;
  description?: string;
};

function show(kind: ToastKind, payload: ToastPayload) {
  const { title, description } = payload;

  if (kind === "success") {
    sonnerToast.success(title, { description });
    return;
  }

  if (kind === "warning") {
    sonnerToast(title, {
      description,
      className: "mw-toast-warning",
    });
    return;
  }

  if (kind === "error") {
    sonnerToast.error(title, { description });
    return;
  }

  sonnerToast(title, { description });
}

function actionResult<T>(
  result: ActionResult<T>,
  options?: {
    successTitle?: string;
    errorTitle?: string;
  },
) {
  if (result.success) {
    show("success", {
      title: result.message || options?.successTitle || "Operazione completata",
    });
    return;
  }

  const title = options?.errorTitle || result.error;
  const description = options?.errorTitle ? result.error : undefined;
  const kind = result.errorType === "warning" ? "warning" : "error";
  show(kind, { title, description });
}

export const toast = {
  success: (title: string, description?: string) => show("success", { title, description }),
  warning: (title: string, description?: string) => show("warning", { title, description }),
  error: (title: string, description?: string) => show("error", { title, description }),
  info: (title: string, description?: string) => show("info", { title, description }),
  actionResult,
  dismiss: sonnerToast.dismiss,
};
