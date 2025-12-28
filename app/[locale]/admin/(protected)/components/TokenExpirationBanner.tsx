/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useMemo, useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Token Expiration Banner Component
 **************************************************/
export default function TokenExpirationBanner() {
  const [data, setData] = useState<{
    expirationDate: string | null;
    daysUntilExpiration: number | null;
    isExpiringSoon: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenExpiration = async () => {
      try {
        const res = await fetch("/api/github/token-expiration");
        if (!res.ok) throw new Error("Failed to fetch token expiration");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenExpiration();
  }, []);

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

  if (!isExpiringSoon) {
    return null;
  }

  return (
    <div className={cn("mb-6 p-4 border bg-red-50/80 border-red-200 text-red-800")}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Token GitHub in scadenza</p>
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
