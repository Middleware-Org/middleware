"use client";

import dynamic from "next/dynamic";

const BookmarkManager = dynamic(() => import("./BookmarkManager"), {
  ssr: false,
  loading: () => null,
});

type BookmarkManagerLazyProps = {
  articleSlug: string;
  contentContainerSelector?: string;
};

export default function BookmarkManagerLazy({
  articleSlug,
  contentContainerSelector,
}: BookmarkManagerLazyProps) {
  return (
    <BookmarkManager
      articleSlug={articleSlug}
      contentContainerSelector={contentContainerSelector}
    />
  );
}
