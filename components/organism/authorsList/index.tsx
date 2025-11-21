/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/classes";
import { scrollToElement } from "@/lib/utils/window";
import type { Author } from "@/.velite";
import { useAuthorsList } from "@/lib/store/authorsList";
import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const MOBILE_OFFSET = 115;
const DESKTOP_OFFSET = 155;

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
  const isMobile = useIsMobile();

  /* **************************************************
   * Handlers
   **************************************************/
  function handleAuthorClick(author: Author) {
    const elementId = author.slug;
    const offset = isMobile ? MOBILE_OFFSET : DESKTOP_OFFSET;
    scrollToElement(elementId, offset);
    closeOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {authors.map((author) => (
        <div key={author.slug} className={styles.item}>
          <Button
            variants="unstyled"
            onClick={() => handleAuthorClick(author)}
            className={styles.button}
          >
            <MonoTextLight className={styles.buttonText}>{author.name}</MonoTextLight>
          </Button>
          <Separator />
        </div>
      ))}
    </div>
  );
}
