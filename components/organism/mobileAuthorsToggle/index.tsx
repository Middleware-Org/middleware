/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { AuthorsDictionary } from "@/lib/i18n/types";
import { useAuthorsList } from "@/lib/store/authorsList";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type MobileAuthorsToggleProps = {
  dict: Pick<AuthorsDictionary, "page">;
};

/* **************************************************
 * MobileAuthorsToggle Component
 **************************************************/
export default function MobileAuthorsToggle({ dict }: MobileAuthorsToggleProps) {
  const { isOpen, toggleOpen } = useAuthorsList();

  const buttonText = isOpen ? dict.page.hideQuickLinks : dict.page.showQuickLinks;
  const buttonVariant = isOpen ? "secondary" : "primary";

  return (
    <Button onClick={toggleOpen} variants={buttonVariant}>
      <MonoTextLight className={isOpen ? styles.buttonTextClosed : styles.buttonTextOpen}>
        {buttonText}
      </MonoTextLight>
    </Button>
  );
}
