/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import Link from "next/link";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";
import { formatDateByLang } from "@/lib/utils/date";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticleInEvidenceCardProps = {
  article: {
    id: string;
    excerpt: string;
    title: string;
    date: string;
    cover: string;
    alt_cover: string;
    color: string;
    author: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
  dict: {
    articleCard: {
      wordsBy: string;
      readMore: string;
    };
  };
};

/* **************************************************
 * ArticleInEvidenceCard
 **************************************************/
export default function ArticleInEvidenceCard({ article, dict }: ArticleInEvidenceCardProps) {
  const { lang = "it" } = useParams() as { lang: "it" };
  const isMobile = useIsMobile();
  const { textColor, backgroundColor } = getTextColor(article.color);

  return (
    <article className={styles.article} style={{ backgroundColor: article.color }}>
      <header className={styles.header}>
        <div className={styles.badgesMobile}>
          <div className={styles.badgeDate}>
            <MonoTextLight className={styles.badgeTextDate}>
              {formatDateByLang(article.date, lang, isMobile)}
            </MonoTextLight>
          </div>
          <div className={styles.badgeTitle}>
            <MonoTextLight className={styles.badgeTextTitle}>{article.title}</MonoTextLight>
          </div>
        </div>
        <Link href={`/articles/${article.id}`}>
          <H3 className={cn(styles.title, textColor)}>{article.title}</H3>
        </Link>

        <div className={styles.authorInfo}>
          <MonoTextLight className={cn(styles.authorLabel, textColor)}>
            {dict.articleCard.wordsBy}
          </MonoTextLight>
          <Link href={`/authors#${article.author.id}`}>
            <MonoTextBold className={cn(styles.authorLink, textColor)}>
              {article.author.name}
            </MonoTextBold>
          </Link>
        </div>
      </header>
      <Separator className={cn(backgroundColor)} />
      <section>
        <SerifText className={cn(styles.excerpt, textColor)}>{article.excerpt}</SerifText>
        <div className={styles.readMore}>
          <Link href={`/articles/${article.id}`}>
            <MonoTextBold className={cn(styles.readMoreLink, textColor)}>
              {dict.articleCard.readMore} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
      <Separator className={cn(backgroundColor)} />
      <footer>
        <Link href={`/categories#${article.category.id}`}>
          <div className={styles.category}>
            <MonoTextLight className={cn(styles.categoryLink, textColor)}>
              {article.category.name}
            </MonoTextLight>
          </div>
        </Link>
      </footer>
      <Separator className={cn(backgroundColor)} />
    </article>
  );
}
