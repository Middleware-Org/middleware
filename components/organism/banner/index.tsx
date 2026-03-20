"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { withLocale } from "@/lib/i18n/path";
import type { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";

type PolicyBannerProps = {
  className?: string;
  dict: Pick<CommonDictionary, "banner">;
  locale: string;
  cookieName?: string;
  maxAgeDays?: number;
};

export default function PolicyBanner({
  className,
  dict,
  locale,
  cookieName = "policyAccepted",
  maxAgeDays = 180,
}: PolicyBannerProps) {
  const [hasAck, setHasAck] = useState(true);

  useEffect(() => {
    const accepted = document.cookie
      .split(";")
      .map((item) => item.trim())
      .some((item) => item.startsWith(`${cookieName}=`));

    const timeoutId = window.setTimeout(() => {
      setHasAck(accepted);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cookieName]);

  if (hasAck) {
    return null;
  }

  function accept() {
    const maxAge = maxAgeDays * 24 * 60 * 60;
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${cookieName}=1; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
    setHasAck(true);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Policy notice"
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 border-t border-secondary bg-primary",
        "px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.12)]",
        className ?? "",
      )}
    >
      <div className="max-w-[1472px] mx-auto flex flex-col gap-3">
        <MonoTextLight className="text-sm">
          {dict.banner.message}{" "}
          <Link href={withLocale("/privacy-policy", locale)}>
            <span className="underline">{dict.banner.privacy}</span>
          </Link>{" "}
          &amp;{" "}
          <Link href={withLocale("/cookie-policy", locale)}>
            <span className="underline">{dict.banner.cookie}</span>
          </Link>
          .
        </MonoTextLight>

        <div className="flex items-center justify-end gap-2">
          <Button
            variants="secondary"
            className="w-fit!"
            type="button"
            onClick={accept}
            aria-label={dict.banner.accept}
          >
            <MonoTextLight className="text-primary">{dict.banner.accept}</MonoTextLight>
          </Button>
        </div>
      </div>
    </div>
  );
}
