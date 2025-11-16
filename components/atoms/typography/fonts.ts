import localFont from "next/font/local";

export const editorRegular = localFont({
  src: [
    {
      path: "../../../fonts/EditorRegular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

export const editorBold = localFont({
  src: [
    {
      path: "../../../fonts/EditorBold.otf",
      weight: "300",
      style: "normal",
    },
  ],
  display: "swap",
});

export const gtAmericaMonoBold = localFont({
  src: [
    {
      path: "../../../fonts/GT-America-Mono-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const gtAmericaMonoLight = localFont({
  src: [
    {
      path: "../../../fonts/GT-America-Mono-Light.otf",
      weight: "300",
      style: "normal",
    },
  ],
  display: "swap",
});
