import { cookies } from "next/headers";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";
import Link from "next/link";
import { CommonDictionary } from "@/lib/i18n/types";
import { withLocale } from "@/lib/i18n/path";

type PolicyBannerProps = {
  className?: string;
  dict: Pick<CommonDictionary, "banner">;
  locale: string;
  cookieName?: string;
  maxAgeDays?: number;
};

export default async function PolicyBanner({
  className,
  dict,
  locale,
  cookieName = "policyAccepted",
  maxAgeDays = 180,
}: PolicyBannerProps) {
  const cookieStore = cookies();
  const hasAck = (await cookieStore).get(cookieName);

  if (hasAck) return null;

  async function accept() {
    "use server";
    const cookieStore = cookies();
    const maxAge = maxAgeDays * 24 * 60 * 60;

    (await cookieStore).set({
      name: cookieName,
      value: "1",
      maxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
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

        <form action={accept} className="flex items-center justify-end gap-2">
          <Button
            variants="secondary"
            className="w-fit!"
            type="submit"
            aria-label={dict.banner.accept}
          >
            <MonoTextLight className="text-primary">{dict.banner.accept}</MonoTextLight>
          </Button>
        </form>
      </div>
    </div>
  );
}
