/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import Pictogram from "@/components/organism/pictogram";
import { MonoTextBold } from "@/components/atoms/typography";
import type { CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface LogoProps {
  dict: Pick<CommonDictionary, "title">;
  size?: number;
}

/* **************************************************
 * Logo
 **************************************************/
export default function Logo({ dict, size = 48 }: LogoProps) {
  return (
    <div className={styles.logoContainer}>
      <Pictogram size={size} />
      <Link href="/">
        <MonoTextBold className={styles.logoText}>{dict.title}</MonoTextBold>
      </Link>
    </div>
  );
}
