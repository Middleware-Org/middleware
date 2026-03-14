"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

type AppToasterProps = ToasterProps;

export default function Toaster(props: AppToasterProps) {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast: "mw-toast",
          title: "mw-toast-title",
          description: "mw-toast-description",
          actionButton: "mw-toast-action",
          cancelButton: "mw-toast-cancel",
          closeButton: "mw-toast-close",
        },
      }}
      {...props}
    />
  );
}
