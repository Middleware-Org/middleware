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
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch token expiration on component mount
  useEffect(() => {
    let cancelled = false;

    async function fetchTokenExpiration() {
      try {
        setIsLoading(true);
        setError(false);
        const response = await fetch("/api/github/token-expiration");
        if (!response.ok) throw new Error("Failed to fetch token expiration");
        const result = await response.json();
        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTokenExpiration();

    return () => {
      cancelled = true;
    };
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
