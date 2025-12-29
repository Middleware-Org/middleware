"use client";

/* **************************************************
 * Global Error Boundary
 * Catches and handles React errors gracefully
 **************************************************/
import { useEffect } from "react";
import { MonoTextBold, SerifText } from "@/components/atoms/typography";
import Button from "@/components/atoms/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <SerifText className="text-6xl md:text-8xl font-bold text-secondary mb-4">
            Ops!
          </SerifText>
          <MonoTextBold className="text-xl md:text-2xl text-secondary mb-6">
            Qualcosa è andato storto
          </MonoTextBold>
          <MonoTextBold className="text-sm text-secondary opacity-70">
            Si è verificato un errore inaspettato. Stiamo lavorando per risolverlo.
          </MonoTextBold>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-secondary text-primary rounded text-left overflow-auto">
            <MonoTextBold className="text-xs mb-2">Debug Info:</MonoTextBold>
            <pre className="text-xs whitespace-pre-wrap break-words">
              {error.message}
              {error.digest && `\nError ID: ${error.digest}`}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            aria-label="Riprova a caricare la pagina"
            className="px-6 py-3 bg-tertiary text-primary rounded hover:opacity-80 transition-opacity"
          >
            <MonoTextBold>Riprova</MonoTextBold>
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            aria-label="Torna alla homepage"
            className="px-6 py-3 bg-secondary text-primary rounded hover:opacity-80 transition-opacity"
          >
            <MonoTextBold>Torna alla Home</MonoTextBold>
          </Button>
        </div>
      </div>
    </div>
  );
}
