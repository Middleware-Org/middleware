"use client";

import dynamic from "next/dynamic";

import type { CommonDictionary } from "@/lib/i18n/types";

type MenuProps = {
  dict: Pick<CommonDictionary, "aria" | "meta" | "title">;
};

const LazyMenu = dynamic<MenuProps>(() => import("./index"), {
  ssr: false,
});

export default LazyMenu;
