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
import type { Category } from "@/.velite";
import { useCategoriesList } from "@/lib/store/categoriesList";
import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const MOBILE_OFFSET = 115;
const DESKTOP_OFFSET = 155;

/* **************************************************
 * Types
 **************************************************/
type CategoriesListProps = {
  categories: Category[];
};

/* **************************************************
 * CategoriesList Component
 **************************************************/
export default function CategoriesList({ categories }: CategoriesListProps) {
  const { isOpen, closeOpen } = useCategoriesList();
  const isMobile = useIsMobile();

  /* **************************************************
   * Handlers
   **************************************************/
  function handleCategoryClick(category: Category) {
    const elementId = category.slug;
    const offset = isMobile ? MOBILE_OFFSET : DESKTOP_OFFSET;
    scrollToElement(elementId, offset);
    closeOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {categories.map((category) => (
        <div key={category.slug} className={styles.item}>
          <Button
            variants="unstyled"
            onClick={() => handleCategoryClick(category)}
            className={styles.button}
          >
            <MonoTextLight className={styles.buttonText}>{category.name}</MonoTextLight>
          </Button>
          <Separator />
        </div>
      ))}
    </div>
  );
}
