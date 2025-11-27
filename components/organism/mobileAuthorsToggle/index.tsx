/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { AuthorsDictionary } from "@/lib/i18n/types";
import { useAuthorsList } from "@/lib/store/authorsList";
import { cn } from "@/lib/utils/classes";
import type { Author } from "@/.velite";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type MobileAuthorsToggleProps = {
  dict: Pick<AuthorsDictionary, "page">;
  authors: Author[];
};

/* **************************************************
 * MobileAuthorsToggle Component
 **************************************************/
export default function MobileAuthorsToggle({ dict, authors }: MobileAuthorsToggleProps) {
  const { isOpen, toggleOpen, closeOpen } = useAuthorsList();
  const searchParams = useSearchParams();
  const activeAuthor = searchParams.get("author");

  const buttonText = isOpen ? dict.page.hideQuickLinks : dict.page.showQuickLinks;
  const buttonVariant = isOpen ? "secondary" : "primary";

  function handleAuthorClick() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    }
    closeOpen();
  }

  return (
    <div className={styles.wrapper}>
      <Button onClick={toggleOpen} variants={buttonVariant}>
        <MonoTextLight className={isOpen ? styles.buttonTextClosed : styles.buttonTextOpen}>
          {buttonText}
        </MonoTextLight>
      </Button>
      {isOpen && (
        <div className={styles.list}>
          {authors.map((author) => {
            const isActive = activeAuthor === author.slug;
            return (
              <div key={author.slug} className={styles.item}>
                <Link
                  href={`?author=${author.slug}`}
                  onClick={handleAuthorClick}
                  className={styles.link}
                >
                  <MonoTextLight className={cn(styles.linkText, isActive ? "text-tertiary" : "")}>
                    {author.name}
                  </MonoTextLight>
                </Link>
                <Separator />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
