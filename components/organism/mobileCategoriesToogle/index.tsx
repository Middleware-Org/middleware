/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { CategoriesDictionary } from "@/lib/i18n/types";
import { useCategoriesList } from "@/lib/store/categoriesList";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type MobileCategoriesToggleProps = {
  dict: Pick<CategoriesDictionary, "page">;
};

/* **************************************************
 * MobileCategoriesToggle Component
 **************************************************/
export default function MobileCategoriesToggle({ dict }: MobileCategoriesToggleProps) {
  const { isOpen, toggleOpen } = useCategoriesList();

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
