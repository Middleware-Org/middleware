/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";

/* **************************************************
 * SWR Cache Indicator Component
 * Mostra lo stato della cache SWR per debug
 **************************************************/
export default function SWRCacheIndicator() {
  const { cache } = useSWRConfig();
  const [cacheState, setCacheState] = useState<
    Array<{ key: string; hasData: boolean; itemCount: number }>
  >([]);

  // Aggiorna lo stato della cache periodicamente
  useEffect(() => {
    const updateCacheState = () => {
      try {
        const cacheKeys = Array.from(cache.keys());
        const entries = cacheKeys.map((key) => {
          const keyStr = String(key);
          const data = cache.get(key);
          const hasData = data !== undefined;
          return {
            key: keyStr,
            hasData,
            itemCount: Array.isArray(data) ? data.length : data ? 1 : 0,
          };
        });
        setCacheState(entries);
      } catch (error) {
        console.error("[SWR Cache Indicator] Error reading cache:", error);
      }
    };

    // Aggiorna immediatamente
    updateCacheState();

    // Aggiorna ogni 500ms per vedere i cambiamenti in tempo reale
    const interval = setInterval(updateCacheState, 500);

    return () => clearInterval(interval);
  }, [cache]);

  if (process.env.NODE_ENV !== "development") {
    return null; // Solo in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md z-50 shadow-lg">
      <div className="font-bold mb-2 text-sm">SWR Cache Status</div>
      <div className="mb-2">
        <strong>Cache Keys:</strong> {cacheState.length}
      </div>
      {cacheState.length === 0 ? (
        <div className="text-yellow-400 text-xs italic">
          Cache vuota - verrà popolata quando gli hook SWR vengono chiamati
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          {cacheState.map((entry) => (
            <div key={entry.key} className="mb-2 p-2 bg-white/10 rounded">
              <div className="font-mono text-xs break-all">{entry.key}</div>
              <div className={entry.hasData ? "text-green-400" : "text-red-400"}>
                {entry.hasData ? "✓ Cached" : "✗ Not cached"}
              </div>
              {entry.hasData && entry.itemCount > 0 && (
                <div className="text-gray-400 mt-1">Items: {entry.itemCount}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
