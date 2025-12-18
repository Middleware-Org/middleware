/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/classes";
import useSWR from "swr";
import { createFetcher } from "@/hooks/swr/fetcher";

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
export default function TokenExpirationBanner() {
  const { data, error, isLoading } = useSWR("/api/github/token-expiration", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const bannerContent = useMemo(() => {
    if (isLoading || error || !data) {
      return null;
    }

    if (!data.expirationDate || data.daysUntilExpiration === null) {
      return null;
    }

    const expirationDate = new Date(data.expirationDate);
    const formattedDate = expirationDate.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      expirationDate: formattedDate,
      daysUntilExpiration: data.daysUntilExpiration,
      isExpiringSoon: data.isExpiringSoon,
    };
  }, [data, error, isLoading]);

  if (!bannerContent) {
    return null;
  }

  const { expirationDate, daysUntilExpiration, isExpiringSoon } = bannerContent;

  return (
    <div
      className={cn(
        "mb-6 p-4 border",
        isExpiringSoon
          ? "bg-red-50/80 border-red-200 text-red-800"
          : "bg-primary border-secondary text-secondary",
      )}
    >
      <div className="flex items-start gap-3">
        {isExpiringSoon && <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isExpiringSoon ? "Token GitHub in scadenza" : "Token GitHub - Scadenza"}
          </p>
          <p className="text-sm mt-1">
            Il token GitHub scadrà il <span className="font-semibold">{expirationDate}</span>
            {daysUntilExpiration !== null && (
              <>
                {" "}
                (tra{" "}
                <span className="font-semibold">
                  {daysUntilExpiration === 0
                    ? "oggi"
                    : daysUntilExpiration === 1
                      ? "1 giorno"
                      : `${daysUntilExpiration} giorni`}
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
