/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";
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
  return (
    <Link href="/">
      <span className={cn(styles.pictogram, className ?? "")}>
        <Image src="/logo.svg" alt="" width={size} height={size} priority />
      </span>
    </Link>
  );
}
