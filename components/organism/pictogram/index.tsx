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
}

/* **************************************************
 * Pictogram
 **************************************************/
export default function Pictogram({ className }: PictogramProps) {
  return (
    <Link href="/">
      <span className={cn(styles.pictogram, className ?? "")}>
        <Image src="/logo.svg" alt="" width={48} height={48} priority />
      </span>
    </Link>
  );
}
