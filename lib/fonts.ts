import localFont from "next/font/local";

/**
 * Editor Font Family - Main font for body text
 * Optimized with next/font for automatic subsetting and preloading
 */
export const editorFont = localFont({
  src: [
    {
      path: "../public/fonts/EditorRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/EditorBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-editor",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

/**
 * GT America Mono - Monospace font for code and special text
 * Optimized with next/font for automatic subsetting and preloading
 */
export const gtAmericaMono = localFont({
  src: [
    {
      path: "../public/fonts/GT-America-Mono-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/GT-America-Mono-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gt-america-mono",
  display: "swap",
  preload: true,
  fallback: ["Courier New", "monospace"],
});
