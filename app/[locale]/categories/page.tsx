/* **************************************************
 * Imports
 **************************************************/
import CategoriesList from "@/components/organism/categoriesList";
import MobileCategoriesToggle from "@/components/organism/mobileCategoriesToogle";
import { getAllCategories } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import Category from "@/components/organism/category";
import { cn } from "@/lib/utils/classes";
import AutoScroll from "@/components/AutoScroll";

/* **************************************************
 * Types
 **************************************************/
type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-4 lg:px-10 py-0 lg:py-10"),
  mobileToggle: cn(
    "lg:hidden md:flex flex sticky top-[95px] md:top-[115px] pt-[20px] pb-[20px] bg-primary w-full",
  ),
  grid: cn("grid grid-cols-1 lg:grid-cols-[295px_auto] gap-10"),
  sidebar: cn("lg:sticky lg:top-[155px] lg:h-fit"),
  content: cn("flex flex-col gap-10"),
};

/* **************************************************
 * Categories Page
 **************************************************/
export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const dictCategories = await getDictionary(locale, TRANSLATION_NAMESPACES.CATEGORIES);
  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const categories = getAllCategories();

  return (
    <div className={styles.container}>
      <AutoScroll paramName="category" />
      <div className={styles.mobileToggle}>
        <MobileCategoriesToggle dict={dictCategories} categories={categories} />
      </div>

      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <div className="hidden lg:block">
            <CategoriesList categories={categories} />
          </div>
        </div>

        <div className={styles.content}>
          {categories.map((category, index) => (
            <Category
              key={category.slug}
              category={category}
              dictCommon={dictCommon}
              dictCategories={dictCategories}
              isLastCategory={index === categories.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
