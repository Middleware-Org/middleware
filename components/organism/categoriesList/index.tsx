/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  /* **************************************************
   * Handlers
   **************************************************/
  function handleCategoryClick() {
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
      {categories.map((category) => {
        const isActive = activeCategory === category.slug;
        return (
          <div key={category.slug} className={styles.item}>
            <Link
              href={`?category=${category.slug}`}
              onClick={handleCategoryClick}
              className={styles.button}
            >
              <MonoTextLight className={cn(styles.buttonText, isActive && "text-tertiary")}>
                {category.name}
              </MonoTextLight>
            </Link>
            <Separator />
          </div>
        );
      })}
    </div>
  );
}
