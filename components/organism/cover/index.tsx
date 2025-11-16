"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import Image from "next/image";
import { MonoTextLight } from "@/components/atoms/typography";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { formatDateByLang } from "@/lib/utils/date";
import styles from "./styles";
import ArticleInEvidenceCard from "@/components/molecules/articleInEvidenceCard";
import { CommonDictionary } from "@/lib/i18n/types";

/* **************************************************
 * Types
 **************************************************/
type CoverProps = {
  issue: {
    id: string;
    title: string;
    date: string;
    cover: string;
    alt_cover: string;
    color: string;
  };
  articleInEvidence?: {
    id: string;
    title: string;
    date: string;
    cover: string;
    alt_cover: string;
    color: string;
    excerpt: string;
    author: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
  dict: Pick<CommonDictionary, "articleCard">;
};

/* **************************************************
 * Constants
 **************************************************/
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 500;

/* **************************************************
 * Cover
 **************************************************/
export default function Cover({ issue, articleInEvidence, dict }: CoverProps) {
  const isMobile = useIsMobile();
  const { lang = "it" } = useParams() as { lang: string };

  return (
    <div className={styles.link}>
      <div className={styles.container}>
        <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
          <Image
            src={issue.cover}
            alt={issue.alt_cover}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className={styles.image}
            priority
          />
          <div className={styles.badgesWrapper}>
            <div className={styles.badgeDate}>
              <MonoTextLight className={styles.badgeTextDate}>
                {formatDateByLang(issue.date, lang as "it", isMobile)}
              </MonoTextLight>
            </div>
            <div className={styles.badgeTitle}>
              <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
            </div>
          </div>
        </div>
        <div className={styles.footer} style={{ backgroundColor: issue.color }}>
          {articleInEvidence && <ArticleInEvidenceCard article={articleInEvidence} dict={dict} />}
        </div>
      </div>
    </div>
  );
}
