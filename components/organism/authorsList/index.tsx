/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { cn } from "@/lib/utils/classes";
import type { Author } from "@/.velite";
import { useAuthorsList } from "@/lib/store/authorsList";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type AuthorsListProps = {
  authors: Author[];
};

/* **************************************************
 * AuthorsList Component
 **************************************************/
export default function AuthorsList({ authors }: AuthorsListProps) {
  const { isOpen, closeOpen } = useAuthorsList();
  const searchParams = useSearchParams();
  const activeAuthor = searchParams.get("author");

  /* **************************************************
   * Handlers
   **************************************************/
  function handleAuthorClick() {
    // Save current scroll position before Next.js resets it
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    }
    closeOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {authors.map((author) => {
        const isActive = activeAuthor === author.slug;
        return (
          <div key={author.slug} className={styles.item}>
            <Link
              href={`?author=${author.slug}`}
              onClick={handleAuthorClick}
              className={styles.button}
            >
              <MonoTextLight className={cn(styles.buttonText, isActive ? "text-tertiary" : "")}>
                {author.name}
              </MonoTextLight>
            </Link>
            <Separator />
          </div>
        );
      })}
    </div>
  );
}
