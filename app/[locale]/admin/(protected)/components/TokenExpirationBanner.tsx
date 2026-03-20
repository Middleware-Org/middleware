/* **************************************************
 * Imports
 **************************************************/
"use client";

import { AlertTriangle } from "lucide-react";
import useSWR from "swr";

import { createFetcher } from "@/hooks/swr/fetcher";
import type { AdminDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";

type TokenExpirationBannerProps = {
  locale: string;
  dict: AdminDictionary["tokenBanner"];
};

/* **************************************************
 * Fetcher
 **************************************************/
const fetcher = createFetcher<{
  expirationDate: string | null;
  daysUntilExpiration: number | null;
  isExpiringSoon: boolean;
}>("token-expiration");

/* **************************************************
 * Token Expiration Banner Component
 **************************************************/
export default function TokenExpirationBanner({ locale, dict }: TokenExpirationBannerProps) {
  const { data, error, isLoading } = useSWR("/api/github/token-expiration", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const bannerContent = (() => {
    if (isLoading || error || !data) {
      return null;
    }

    if (!data.expirationDate || data.daysUntilExpiration === null) {
      return null;
    }

    const expirationDate = new Date(data.expirationDate);
    const formattedDate = expirationDate.toLocaleDateString(locale === "it" ? "it-IT" : locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      expirationDate: formattedDate,
      daysUntilExpiration: data.daysUntilExpiration,
      isExpiringSoon: data.isExpiringSoon,
    };
  })();

  if (!bannerContent) {
    return null;
  }

  const { expirationDate, daysUntilExpiration, isExpiringSoon } = bannerContent;

  if (!isExpiringSoon) {
    return null;
  }

  return (
    <div className={cn("mb-6 p-4 border bg-red-50/80 border-red-200 text-red-800")}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{dict.title}</p>
          <p className="text-sm mt-1">
            {dict.prefix} <span className="font-semibold">{expirationDate}</span>
            {daysUntilExpiration !== null && (
              <>
                {" "}
                ({dict.in}{" "}
                <span className="font-semibold">
                  {daysUntilExpiration === 0
                    ? dict.today
                    : daysUntilExpiration === 1
                      ? dict.oneDay
                      : `${daysUntilExpiration} ${dict.manyDays}`}
                </span>
                )
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
