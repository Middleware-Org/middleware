"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";

import { useLocalizedPath } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/classes";

import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface PictogramProps {
  className?: string;
  size?: number;
}

/* **************************************************
 * Pictogram
 **************************************************/
export default function Pictogram({ className, size = 48 }: PictogramProps) {
  const toLocale = useLocalizedPath();

  return (
    <Link href={toLocale("/")}>
      <span className={cn(styles.pictogram, className ?? "")}>
        <Image src="/logo.svg" alt="Middleware" width={size} height={size} />
      </span>
    </Link>
  );
}
