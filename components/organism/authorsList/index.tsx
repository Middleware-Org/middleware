/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
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

  /* **************************************************
   * Handlers
   **************************************************/
  function handleAuthorClick() {
    closeOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {authors.map((author) => (
        <div key={author.slug} className={styles.item}>
          <Link href={`#${author.slug}`} onClick={handleAuthorClick} className={styles.button}>
            <MonoTextLight className={styles.buttonText}>{author.name}</MonoTextLight>
          </Link>
          <Separator />
        </div>
      ))}
    </div>
  );
}
