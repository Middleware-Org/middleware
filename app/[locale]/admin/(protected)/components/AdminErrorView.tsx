"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { toast } from "@/hooks/use-toast";
import { withLocale } from "@/lib/i18n/path";

import { adminErrorCopy } from "./adminErrorCopy";

interface AdminErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  pageKey: keyof typeof adminErrorCopy.pages;
  styles: {
    main: string;
    header: string;
    title: string;
    backButton: string;
    error: string;
    submitButton: string;
    cancelButton: string;
  };
}

export default function AdminErrorView({ error, reset, pageKey, styles }: AdminErrorViewProps) {
  const { locale } = useParams() as { locale?: string };
  const dashboardHref = withLocale("/admin", locale);

  useEffect(() => {
    toast.error(adminErrorCopy.pages[pageKey], error.message);
  }, [error, pageKey]);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>{adminErrorCopy.title}</h1>
        <Link href={dashboardHref} className={styles.backButton}>
          ← {adminErrorCopy.back}
        </Link>
      </div>

      <div className={styles.error}>
        <h2 className="text-lg font-semibold mb-2">{adminErrorCopy.genericHeading}</h2>
        <p className="mb-4">{error.message}</p>
        <div className="flex gap-2">
          <button onClick={reset} className={styles.submitButton}>
            {adminErrorCopy.retry}
          </button>
          <Link href={dashboardHref} className={styles.cancelButton}>
            {adminErrorCopy.backToDashboard}
          </Link>
        </div>
      </div>
    </main>
  );
}
