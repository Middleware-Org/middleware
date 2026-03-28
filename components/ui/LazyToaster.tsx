"use client";

import dynamic from "next/dynamic";

const LazyToaster = dynamic(() => import("@/components/ui/sonner"), {
  ssr: false,
});

export default LazyToaster;
