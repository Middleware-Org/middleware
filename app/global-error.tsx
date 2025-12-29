"use client";

/* **************************************************
 * Global Error Boundary for Root Layout
 * Catches errors in the root layout
 **************************************************/
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff7f4",
            padding: "20px",
          }}
        >
          <div style={{ maxWidth: "600px", textAlign: "center" }}>
            <h1 style={{ fontSize: "3rem", color: "#000", marginBottom: "1rem" }}>
              Ops!
            </h1>
            <p style={{ fontSize: "1.25rem", color: "#000", marginBottom: "2rem" }}>
              Si è verificato un errore critico. Riprova a ricaricare la pagina.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                backgroundColor: "#c2081c",
                color: "#fff7f4",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Riprova
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#000",
                color: "#fff7f4",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Torna alla Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
