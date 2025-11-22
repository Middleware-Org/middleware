/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { cn } from "@/lib/utils/classes";
import type { Category } from "@/.velite";
import { useCategoriesList } from "@/lib/store/categoriesList";
import styles from "./styles";

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

  /* **************************************************
   * Handlers
   **************************************************/
  function handleCategoryClick() {
    closeOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {categories.map((category) => (
        <div key={category.slug} className={styles.item}>
          <Link href={`#${category.slug}`} onClick={handleCategoryClick} className={styles.button}>
            <MonoTextLight className={styles.buttonText}>{category.name}</MonoTextLight>
          </Link>
          <Separator />
        </div>
      ))}
    </div>
  );
}
