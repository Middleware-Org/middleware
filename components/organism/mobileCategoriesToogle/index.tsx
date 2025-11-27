/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { CategoriesDictionary } from "@/lib/i18n/types";
import { useCategoriesList } from "@/lib/store/categoriesList";
import { cn } from "@/lib/utils/classes";
import type { Category } from "@/.velite";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type MobileCategoriesToggleProps = {
  dict: Pick<CategoriesDictionary, "page">;
  categories: Category[];
};

/* **************************************************
 * MobileCategoriesToggle Component
 **************************************************/
export default function MobileCategoriesToggle({ dict, categories }: MobileCategoriesToggleProps) {
  const { isOpen, toggleOpen, closeOpen } = useCategoriesList();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const buttonText = isOpen ? dict.page.hideQuickLinks : dict.page.showQuickLinks;
  const buttonVariant = isOpen ? "secondary" : "primary";

  function handleCategoryClick() {
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
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <div key={category.slug} className={styles.item}>
                <Link
                  href={`?category=${category.slug}`}
                  onClick={handleCategoryClick}
                  className={styles.link}
                >
                  <MonoTextLight className={cn(styles.linkText, isActive ? "text-tertiary" : "")}>
                    {category.name}
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
